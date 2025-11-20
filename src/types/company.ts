export interface Company {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country?: string;
}

export interface CompanyResponse {
  page: number;
  results: Company[];
  total_pages: number;
  total_results: number;
}

export interface CompanyDetails {
  id: number;
  name: string;
  description: string;
  headquarters: string;
  homepage: string;
  logo_path: string | null;
  origin_country: string;
  parent_company: Company | null;
}

