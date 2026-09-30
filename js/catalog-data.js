/* ==========================================================
   Caesar Apparels Ltd — Product catalogue data
   ----------------------------------------------------------
   Edit this list to update the catalogue page (products.html).
   Each product:
     id        unique short id, used in links (e.g. "ld-01")
     name      product name shown on the card
     category  one of the keys in CATALOG_CATEGORIES below
     fabric    one of the keys in CATALOG_FABRICS below, or "request"
     gender    "Women" | "Men" | "Kids" | "Unisex"
     image     path to a 3:4 image in assets/products/
     text      one or two sentences for the quick view
   NOTE: the styles and images below are placeholders — replace
   them with real catalogue styles and photography.
   ========================================================== */

window.CATALOG_CATEGORIES = {
  ladieswear: "Ladieswear",
  menswear: "Menswear",
  kidswear: "Kidswear",
  sportswear: "Sportswear",
  activewear: "Activewear",
  loungewear: "Loungewear",
  shirts: "Casual shirts",
};

window.CATALOG_FABRICS = {
  "viscose-aop": { name: "100% Viscose AOP", note: "All-over printed viscose with a soft, fluid drape." },
  "viscose-crinkle-poplin": { name: "100% Viscose crinkle & poplin", note: "Textured crinkle and crisp poplin weaves in viscose." },
  "cotton-yd": { name: "100% Cotton yarn-dyed", note: "Yarn-dyed cotton for checks, stripes and chambray looks." },
  "poly-fleece": { name: "100% Polyester marled fleece", note: "Brushed marled fleece for sweats and loungewear." },
  "poly-elastane": { name: "Polyester / elastane blends", note: "Stretch blends for sportswear and activewear." },
  request: { name: "Fabric on request", note: "Developed to your specification." },
};

window.CATALOG = [
  { id: "ld-01", name: "Printed midi dress", category: "ladieswear", fabric: "viscose-aop", gender: "Women", image: "assets/products/p-01.jpg", text: "Relaxed midi silhouette in an all-over print, with a tie waist and full sleeves." },
  { id: "ld-02", name: "Printed blouse range", category: "ladieswear", fabric: "viscose-aop", gender: "Women", image: "assets/products/p-02.jpg", text: "Easy-fit blouses developed across multiple prints and colourways for one collection." },
  { id: "ld-03", name: "Striped wide-leg trousers", category: "ladieswear", fabric: "viscose-crinkle-poplin", gender: "Women", image: "assets/products/p-03.jpg", text: "High-rise wide-leg trousers with a fluid fall and pressed front crease." },
  { id: "ld-04", name: "Relaxed poplin shirt", category: "ladieswear", fabric: "viscose-crinkle-poplin", gender: "Women", image: "assets/products/p-04.jpg", text: "Oversized button-through shirt with a clean collar and dropped shoulder." },
  { id: "sh-01", name: "Printed casual shirt", category: "shirts", fabric: "cotton-yd", gender: "Men", image: "assets/products/p-05.jpg", text: "Regular-fit casual shirt with a small repeat pattern and button-down collar." },
  { id: "sh-02", name: "Chambray-look shirt", category: "shirts", fabric: "cotton-yd", gender: "Men", image: "assets/products/p-06.jpg", text: "Washed chambray-look shirt with a single chest pocket." },
  { id: "mn-01", name: "Casual overshirt jacket", category: "menswear", fabric: "request", gender: "Men", image: "assets/products/p-07.jpg", text: "Lightweight overshirt jacket for layering, with a snap front." },
  { id: "mn-02", name: "Tipped crew-neck tee", category: "menswear", fabric: "request", gender: "Men", image: "assets/products/p-08.jpg", text: "Boxy crew-neck tee with contrast tipping on the collar and sleeves." },
  { id: "mn-03", name: "Graphic tee", category: "menswear", fabric: "request", gender: "Men", image: "assets/products/p-09.jpg", text: "Classic-fit tee with a chest print, ready for your artwork." },
  { id: "lg-01", name: "Marled fleece hoodie", category: "loungewear", fabric: "poly-fleece", gender: "Unisex", image: "assets/products/p-10.jpg", text: "Pullover hoodie in brushed marled fleece with a lined hood." },
  { id: "lg-02", name: "Crew-neck sweatshirt", category: "loungewear", fabric: "poly-fleece", gender: "Unisex", image: "assets/products/p-11.jpg", text: "Everyday crew-neck sweatshirt with ribbed cuffs and hem." },
  { id: "lg-03", name: "Cuffed joggers", category: "loungewear", fabric: "request", gender: "Women", image: "assets/products/p-12.jpg", text: "Relaxed joggers with an elasticated waist, cuffed hem and patch pockets." },
  { id: "ac-01", name: "Seamless-look sports bra", category: "activewear", fabric: "poly-elastane", gender: "Women", image: "assets/products/p-13.jpg", text: "Medium-support sports bra with a scoop neck and wide underband." },
  { id: "ac-02", name: "Racer-back training bra", category: "activewear", fabric: "poly-elastane", gender: "Women", image: "assets/products/p-14.jpg", text: "Racer-back training bra with a keyhole detail for strength sessions." },
  { id: "sp-01", name: "Studio training set", category: "sportswear", fabric: "poly-elastane", gender: "Women", image: "assets/products/p-15.jpg", text: "Crop top and high-rise leggings developed as a coordinated set." },
  { id: "kd-01", name: "Cardigan and shorts set", category: "kidswear", fabric: "request", gender: "Kids", image: "assets/products/p-16.jpg", text: "Smart two-piece set with a contrast-trim cardigan and pull-on shorts." },
  { id: "kd-02", name: "Kids essential tee", category: "kidswear", fabric: "request", gender: "Kids", image: "assets/products/p-17.jpg", text: "Soft crew-neck tee in bright solids for everyday wear." },
  { id: "kd-03", name: "Kids casual layers", category: "kidswear", fabric: "request", gender: "Kids", image: "assets/products/p-18.jpg", text: "Graphic tees and henleys designed to mix and match across a range." },
];
