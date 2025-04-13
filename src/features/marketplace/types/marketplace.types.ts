export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'PRODUCT' | 'SERVICE';
  category: string;
  imageUrl?: string;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
}

export interface CategoryCard {
  title: string;
  description: string;
  icon: string;
  slug: string;
}
