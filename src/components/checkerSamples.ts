export const demoCsv = `Item ID,Title,Link,Issue,Status,Price,Availability
SKU-1001,Blue Running Shoes,https://example.com/shoes,Mismatched product price,Disapproved,79.99 USD,in stock
SKU-1002,Black Backpack,https://example.com/backpack,Mismatched product availability,Disapproved,49.00 USD,out of stock
SKU-1003,Travel Mug,https://example.com/mug,Mismatched domains,Needs attention,19.00 USD,in stock
SKU-1004,Winter Jacket,https://example.com/jacket,Mismatched product price,Disapproved,129.00 USD,in stock
SKU-1005,Cotton T-Shirt,https://example.com/shirt,Pending website check,Warning,24.00 USD,in stock`;

export const demoSchema = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Blue Running Shoes",
    offers: {
      "@type": "Offer",
      price: "79.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  },
  null,
  2,
);
