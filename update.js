const fs = require('fs');
let data = fs.readFileSync('prisma/seeders/data/products.ts', 'utf8');
data = data.replace(/brand: "([^"]+)"/g, (match, p1) => {
    const slug = p1.toLowerCase().replace(/ /g, '-');
    return `brandId: "${slug}"`;
});
fs.writeFileSync('prisma/seeders/data/products.ts', data);
console.log("Updated products.ts");
