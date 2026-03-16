import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CatsStackParamList = {
  CatList: undefined;
  CatDetail: { catId: string; catName: string };
  CreateCat: undefined;
  FeedCat: { catId: string };
  Cook: { catId: string };
  Jobs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  CatsStack: undefined;
  House: undefined;
  Shop: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type CatListScreenProps = NativeStackScreenProps<CatsStackParamList, 'CatList'>;
export type CatDetailScreenProps = NativeStackScreenProps<CatsStackParamList, 'CatDetail'>;
export type CreateCatScreenProps = NativeStackScreenProps<CatsStackParamList, 'CreateCat'>;
export type FeedCatScreenProps = NativeStackScreenProps<CatsStackParamList, 'FeedCat'>;
export type CookScreenProps = NativeStackScreenProps<CatsStackParamList, 'Cook'>;
export type JobsScreenProps = NativeStackScreenProps<CatsStackParamList, 'Jobs'>;
