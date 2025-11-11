import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';

import { supabaseConfig, supabaseRest } from '../services/supabaseClient';

interface UserRecord {
  id: string;
  username: string;
  password_hash: string;
}

export interface AuthUser {
  id: string;
  username: string;
}

const USERS_TABLE = 'users';
const LOCAL_USERS_KEY = '@airlineapp:users';
const SALT_ROUNDS = 10;

// bcryptjs relies on crypto-grade randomness for salting. React Native lacks the built-in
// WebCrypto/Node crypto modules, so provide a lightweight fallback powered by Math.random.
// This avoids runtime errors while still producing sufficient variability for local dev auth.
const attachRandomFallback = () => {
  if ((bcrypt as any)._randomFallbackAttached) {
    return;
  }

  bcrypt.setRandomFallback((length: number) => {
    const bytes: number[] = [];
    for (let i = 0; i < length; i += 1) {
      bytes.push(Math.floor(Math.random() * 256));
    }
    return bytes;
  });

  (bcrypt as any)._randomFallbackAttached = true;
};

attachRandomFallback();

const defaultLocalUsers: UserRecord[] = [
  {
    id: 'mock-user-001',
    username: 'traveler',
    password_hash: '$2b$10$JxKk8YHy2NkqUyneWWZWg.EhRrZoFeSJdUeNQ5Ci562ejdApqWt5.', // pw: traveler123
  },
];

const ensureLocalSeed = async () => {
  const existing = await AsyncStorage.getItem(LOCAL_USERS_KEY);
  if (!existing) {
    await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultLocalUsers));
  }
};

const readLocalUsers = async (): Promise<UserRecord[]> => {
  await ensureLocalSeed();
  const raw = await AsyncStorage.getItem(LOCAL_USERS_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as UserRecord[];
  } catch (error) {
    console.warn('Failed to parse local users', error);
    return [];
  }
};

const writeLocalUsers = async (users: UserRecord[]) => {
  await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const createUserId = () => `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const hashPassword = (password: string): Promise<string> =>
  new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (error, hashed) => {
      if (error || !hashed) {
        reject(error ?? new Error('Unable to hash password.'));
        return;
      }
      resolve(hashed);
    });
  });

const verifyPassword = (password: string, hash: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (error, isMatch) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(Boolean(isMatch));
    });
  });

const normalizeUser = (record: UserRecord): AuthUser => ({
  id: record.id,
  username: record.username,
});

const fetchRemoteUser = async (username: string): Promise<UserRecord | undefined> => {
  const query = new URLSearchParams({
    username: `eq.${username}`,
    limit: '1',
  }).toString();

  const { data, error } = await supabaseRest<UserRecord[]>({
    table: USERS_TABLE,
    query,
    select: 'id,username,password_hash',
  });

  if (error) {
    throw new Error('Unable to contact server. Please try again.');
  }

  return data?.[0];
};

export const loginUser = async (username: string, password: string): Promise<AuthUser> => {
  if (!username.trim() || !password) {
    throw new Error('Username and password are required.');
  }

  if (supabaseConfig.isConfigured) {
    const record = await fetchRemoteUser(username.trim());
    if (!record) {
      throw new Error('Account not found.');
    }

    const isValid = await verifyPassword(password, record.password_hash);
    if (!isValid) {
      throw new Error('Incorrect username or password.');
    }

    return normalizeUser(record);
  }

  const users = await readLocalUsers();
  const record = users.find((item) => item.username.toLowerCase() === username.trim().toLowerCase());
  if (!record) {
    throw new Error('Account not found.');
  }

  const isValid = await verifyPassword(password, record.password_hash);
  if (!isValid) {
    throw new Error('Incorrect username or password.');
  }

  return normalizeUser(record);
};

export const signupUser = async (username: string, password: string): Promise<AuthUser> => {
  const trimmedUsername = username.trim();
  if (!trimmedUsername || trimmedUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const passwordHash = await hashPassword(password);

  const newRecord: UserRecord = {
    id: createUserId(),
    username: trimmedUsername,
    password_hash: passwordHash,
  };

  if (supabaseConfig.isConfigured) {
    const existing = await fetchRemoteUser(trimmedUsername);
    if (existing) {
      throw new Error('Username already exists.');
    }

    const { data, error } = await supabaseRest<UserRecord[]>({
      table: USERS_TABLE,
      method: 'POST',
      body: newRecord,
      prefer: 'return=representation',
      select: 'id,username,password_hash',
    });

    if (error || !data || !data[0]) {
      throw new Error('Unable to create account. Please try again.');
    }

    return normalizeUser(data[0]);
  }

  const users = await readLocalUsers();
  if (users.some((item) => item.username.toLowerCase() === trimmedUsername.toLowerCase())) {
    throw new Error('Username already exists.');
  }

  const updated = [...users, newRecord];
  await writeLocalUsers(updated);
  return normalizeUser(newRecord);
};
