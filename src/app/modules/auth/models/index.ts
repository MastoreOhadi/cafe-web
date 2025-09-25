export interface RegisterData {
   email: string;
   phone: string;
   username: string;
   password: string;
   full_name: string;
   province: string;
   city: string;
}

export interface City {
  id: number;
  name: { fa: string; en: string; ar: string };
  provinceId: number;
}

export interface CityValue {
  cityId: number;
  provinceId: number;
}