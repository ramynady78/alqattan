type CategoryLike = {
  id?: number | null;
  slug?: string | null;
};

type ProductLike = {
  slug?: string | null;
};

export function buildCategoryUrl(category: CategoryLike): string {
  if (category.slug) {
    return `/categories/${category.slug}`;
  }

  if (category.id != null) {
    return `/products?categoryId=${category.id}`;
  }

  return "/categories";
}

export function buildProductUrl(product: ProductLike): string {
  return `/products/${product.slug ?? ""}`;
}
