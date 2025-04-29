export interface IHTTPReturn<T = any> {
  success: boolean;
  data?: T;
  status?: number;
  message?: string;
  error?: any;
}
