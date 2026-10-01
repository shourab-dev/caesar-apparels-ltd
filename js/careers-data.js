/* ==========================================================
   Caesar Apparels Ltd — Careers data
   ----------------------------------------------------------
   Edit this file to post, change or remove jobs on careers.html.

   CAREERS_EMAIL     where "Apply now" emails are addressed.
   CAREERS_LOCATIONS location keys used by jobs below.
   CAREERS_JOBS      one entry per open role:
     ref        short unique reference shown to applicants (e.g. "MER-01")
     title      job title
     dept       department name (used for the filter chips)
     location   a key from CAREERS_LOCATIONS
     type       e.g. "Full-time", "Contract"
     summary    one or two sentences shown under the title
     duties     list of responsibilities
     needs      list of requirements
   To close a role, delete its entry. If the list is empty the page
   shows a "no open roles" message with the general-application link.

   NOTE: the roles below are placeholders — replace them with real openings.
   ========================================================== */

window.CAREERS_EMAIL = "info@caesargroup.com";

window.CAREERS_LOCATIONS = {
  chittagong: "Chittagong — corporate office",
  patiya: "Patiya, Chittagong — factory",
  dhaka: "Uttara, Dhaka",
  hongkong: "Kowloon, Hong Kong",
};

window.CAREERS_JOBS = [
  {
    ref: "MER-01", title: "Merchandiser — Knitwear", dept: "Merchandising", location: "chittagong", type: "Full-time",
    summary: "Manage knitwear programmes for European buyers from enquiry to shipment.",
    duties: ["Handle buyer communication, costing and order follow-up", "Coordinate sampling, approvals and production timelines", "Track materials and trims against the time-and-action plan"],
    needs: ["Experience in knit garment merchandising", "Clear written and spoken English", "Confident with spreadsheets and email"],
  },
  {
    ref: "MER-02", title: "Senior Merchandiser — Woven", dept: "Merchandising", location: "dhaka", type: "Full-time",
    summary: "Lead woven programmes for key accounts and guide a small merchandising team.",
    duties: ["Own buyer relationships for assigned accounts", "Negotiate costing and delivery with production and sourcing", "Mentor merchandisers and review their order files"],
    needs: ["Several years of woven merchandising experience", "Strong negotiation and planning skills", "Experience with European or US retail buyers"],
  },
  {
    ref: "SRC-01", title: "Fabric Sourcing Executive", dept: "Sourcing", location: "hongkong", type: "Full-time",
    summary: "Work with our fabric partners in China to source, test and deliver fabrics on time.",
    duties: ["Source fabrics and trims to buyer specifications", "Follow up lab dips, strike-offs and fabric testing", "Track shipments from mills to our factory"],
    needs: ["Experience in textile or fabric sourcing", "Knowledge of viscose, cotton and polyester fabrics", "Mandarin is an advantage"],
  },
  {
    ref: "PD-01", title: "Pattern Maker (CAD)", dept: "Product development", location: "patiya", type: "Full-time",
    summary: "Create and grade patterns for samples and bulk production in our development centre.",
    duties: ["Develop patterns from tech packs and buyer comments", "Grade patterns and prepare markers", "Work with sampling to perfect fit"],
    needs: ["Hands-on CAD pattern experience", "Understanding of knit and woven construction", "Attention to fit and measurement detail"],
  },
  {
    ref: "QC-01", title: "Quality Control Inspector", dept: "Quality", location: "patiya", type: "Full-time",
    summary: "Inspect garments in-line and at final stage to keep every order to buyer standard.",
    duties: ["Carry out in-line and final inspections", "Check measurements and workmanship against specifications", "Report defects and follow up corrective actions"],
    needs: ["Experience in garment quality inspection", "Knowledge of AQL sampling", "Good eye for detail"],
  },
  {
    ref: "IE-01", title: "Industrial Engineer", dept: "Production", location: "patiya", type: "Full-time",
    summary: "Improve line balancing and efficiency across our sewing floors.",
    duties: ["Prepare operation breakdowns and SMV studies", "Balance lines and set production targets", "Find and remove bottlenecks with the production team"],
    needs: ["Degree in industrial or textile engineering", "Garment factory experience", "Comfortable working on the production floor"],
  },
  {
    ref: "CMP-01", title: "Compliance Officer", dept: "Compliance", location: "patiya", type: "Full-time",
    summary: "Keep our facilities audit-ready across social, safety and environmental standards.",
    duties: ["Maintain documentation for audits and certifications", "Support fire and building safety programmes", "Coordinate with auditors and buyer compliance teams"],
    needs: ["Experience with social compliance audits", "Knowledge of ACCORD and amfori BSCI requirements", "Organised and detail-oriented"],
  },
];
