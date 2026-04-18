// Taxonomie CMS DepXpreS v3.0
// 20 types de commerce | 69 catégories | 219 sous-catégories | 1412 articles
// Inclut: Fleuriste, Pâtisserie, Bébé/Couches, Boucherie, Poissonnerie, Bio/Vrac, etc.
// NE PAS MODIFIER MANUELLEMENT — généré automatiquement

export interface SampleItem {
  id: string; name_fr: string; level: 4;
  sort_order: number; is_active: boolean;
}
export interface SubCategory {
  id: string; parent_id: string; slug: string; name: string;
  level: 3; sort_order: number; is_active: boolean;
  requires_age_check: boolean; tax_code: string;
  sample_items: SampleItem[];
}
export interface Category {
  id: string; parent_id: string; slug: string; name: string;
  level: 2; sort_order: number; is_active: boolean;
  requires_age_check: boolean; tax_code: string;
  subcategories: SubCategory[];
}
export interface CommerceType {
  id: string; slug: string; name: string;
  level: 1; sort_order: number; is_active: boolean;
  categories: Category[];
}

export const TAXONOMY: CommerceType[] = [
  {
    "id": "CT001",
    "slug": "depanneur-epicerie",
    "name": "Dépanneur / Épicerie de quartier",
    "level": 1,
    "sort_order": 1,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0001",
        "parent_id": "CT001",
        "slug": "boissons-froides",
        "name": "Boissons froides",
        "level": 2,
        "sort_order": 1,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00001",
            "parent_id": "CAT0001",
            "slug": "eaux",
            "name": "Eaux",
            "level": 3,
            "sort_order": 1,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000001",
                "name_fr": "eau plate",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000002",
                "name_fr": "eau pétillante",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000003",
                "name_fr": "eau minérale",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000004",
                "name_fr": "eau aromatisée",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000005",
                "name_fr": "eau de coco",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00002",
            "parent_id": "CAT0001",
            "slug": "sodas",
            "name": "Boissons gazeuses",
            "level": 3,
            "sort_order": 2,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000006",
                "name_fr": "cola",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000007",
                "name_fr": "limonade",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000008",
                "name_fr": "orange",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000009",
                "name_fr": "root beer",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000010",
                "name_fr": "gingembre",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000011",
                "name_fr": "soda diète",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00003",
            "parent_id": "CAT0001",
            "slug": "jus",
            "name": "Jus et nectars",
            "level": 3,
            "sort_order": 3,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000012",
                "name_fr": "jus d'orange",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000013",
                "name_fr": "jus de pomme",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000014",
                "name_fr": "jus multifruits",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000015",
                "name_fr": "nectar mangue",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000016",
                "name_fr": "jus de raisin",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000017",
                "name_fr": "jus de tomate",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00004",
            "parent_id": "CAT0001",
            "slug": "energy",
            "name": "Boissons énergétiques",
            "level": 3,
            "sort_order": 4,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000018",
                "name_fr": "energy drink",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000019",
                "name_fr": "sugar free energy",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000020",
                "name_fr": "shots énergétiques",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000021",
                "name_fr": "matcha energy",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00005",
            "parent_id": "CAT0001",
            "slug": "sport",
            "name": "Boissons sportives",
            "level": 3,
            "sort_order": 5,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000022",
                "name_fr": "isotonique citron",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000023",
                "name_fr": "électrolytes fruits",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000024",
                "name_fr": "boisson récupération",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00006",
            "parent_id": "CAT0001",
            "slug": "thes-glaces",
            "name": "Thés glacés & limonades",
            "level": 3,
            "sort_order": 6,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000025",
                "name_fr": "thé glacé pêche",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000026",
                "name_fr": "limonade rose",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000027",
                "name_fr": "thé vert glacé",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000028",
                "name_fr": "hibiscus glacé",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00007",
            "parent_id": "CAT0001",
            "slug": "cafes-froids",
            "name": "Cafés froids",
            "level": 3,
            "sort_order": 7,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000029",
                "name_fr": "cold brew",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000030",
                "name_fr": "latte glacé",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000031",
                "name_fr": "frappuccino",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000032",
                "name_fr": "café nitro",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00008",
            "parent_id": "CAT0001",
            "slug": "proteines",
            "name": "Boissons protéinées",
            "level": 3,
            "sort_order": 8,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000033",
                "name_fr": "shake chocolat",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000034",
                "name_fr": "shake vanille",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000035",
                "name_fr": "meal replacement",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00009",
            "parent_id": "CAT0001",
            "slug": "vegetales",
            "name": "Boissons végétales",
            "level": 3,
            "sort_order": 9,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000036",
                "name_fr": "lait d'amande",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000037",
                "name_fr": "lait d'avoine",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000038",
                "name_fr": "lait de soya",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000039",
                "name_fr": "lait de coco",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000040",
                "name_fr": "lait de riz",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00010",
            "parent_id": "CAT0001",
            "slug": "kombucha",
            "name": "Kombucha & probiotiques",
            "level": 3,
            "sort_order": 10,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000041",
                "name_fr": "kombucha gingembre",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000042",
                "name_fr": "kombucha framboise",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000043",
                "name_fr": "kéfir de fruit",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0002",
        "parent_id": "CT001",
        "slug": "boissons-chaudes",
        "name": "Boissons chaudes & café",
        "level": 2,
        "sort_order": 2,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00011",
            "parent_id": "CAT0002",
            "slug": "cafe",
            "name": "Café",
            "level": 3,
            "sort_order": 11,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000044",
                "name_fr": "café moulu",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000045",
                "name_fr": "café en grains",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000046",
                "name_fr": "espresso",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000047",
                "name_fr": "décaféiné",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000048",
                "name_fr": "capsules",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00012",
            "parent_id": "CAT0002",
            "slug": "thes",
            "name": "Thés & tisanes",
            "level": 3,
            "sort_order": 12,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000049",
                "name_fr": "thé noir",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000050",
                "name_fr": "thé vert",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000051",
                "name_fr": "camomille",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000052",
                "name_fr": "menthe",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000053",
                "name_fr": "gingembre-citron",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000054",
                "name_fr": "rooibos",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00013",
            "parent_id": "CAT0002",
            "slug": "chocolat-chaud",
            "name": "Chocolat chaud",
            "level": 3,
            "sort_order": 13,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000055",
                "name_fr": "poudre chocolat chaud",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000056",
                "name_fr": "capsules chocolat",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000057",
                "name_fr": "chocolat blanc chaud",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00014",
            "parent_id": "CAT0002",
            "slug": "sucres-cafe",
            "name": "Sucres & accompagnements",
            "level": 3,
            "sort_order": 14,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000058",
                "name_fr": "sucre blanc",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000059",
                "name_fr": "cassonade",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000060",
                "name_fr": "crème à café",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000061",
                "name_fr": "édulcorant",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000062",
                "name_fr": "sirop d'érable",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0003",
        "parent_id": "CT001",
        "slug": "alcool",
        "name": "Alcool",
        "level": 2,
        "sort_order": 3,
        "is_active": true,
        "requires_age_check": true,
        "tax_code": "ALCOOL-TPS-TVQ",
        "subcategories": [
          {
            "id": "SUB00015",
            "parent_id": "CAT0003",
            "slug": "bieres",
            "name": "Bières",
            "level": 3,
            "sort_order": 15,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "ALCOOL-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000063",
                "name_fr": "lager",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000064",
                "name_fr": "IPA",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000065",
                "name_fr": "stout",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000066",
                "name_fr": "blonde",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000067",
                "name_fr": "rousse",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000068",
                "name_fr": "bière locale",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000069",
                "name_fr": "bière sans alcool",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000070",
                "name_fr": "microbrasserie",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00016",
            "parent_id": "CAT0003",
            "slug": "vins",
            "name": "Vins",
            "level": 3,
            "sort_order": 16,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "ALCOOL-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000071",
                "name_fr": "vin rouge",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000072",
                "name_fr": "vin blanc",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000073",
                "name_fr": "vin rosé",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000074",
                "name_fr": "mousseux",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000075",
                "name_fr": "champagne",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000076",
                "name_fr": "vin de glace québécois",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00017",
            "parent_id": "CAT0003",
            "slug": "spiritueux",
            "name": "Spiritueux",
            "level": 3,
            "sort_order": 17,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "ALCOOL-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000077",
                "name_fr": "vodka",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000078",
                "name_fr": "whisky",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000079",
                "name_fr": "rhum",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000080",
                "name_fr": "gin",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000081",
                "name_fr": "tequila",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000082",
                "name_fr": "brandy",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000083",
                "name_fr": "cognac",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00018",
            "parent_id": "CAT0003",
            "slug": "coolers",
            "name": "Prêts-à-boire & coolers",
            "level": 3,
            "sort_order": 18,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "ALCOOL-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000084",
                "name_fr": "cooler fruits",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000085",
                "name_fr": "hard seltzer",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000086",
                "name_fr": "cocktail canette",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000087",
                "name_fr": "sangria prête",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00019",
            "parent_id": "CAT0003",
            "slug": "bar",
            "name": "Accessoires bar",
            "level": 3,
            "sort_order": 19,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "ALCOOL-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000088",
                "name_fr": "tonic",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000089",
                "name_fr": "soda club",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000090",
                "name_fr": "mix cocktail",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000091",
                "name_fr": "grenadine",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000092",
                "name_fr": "bitter",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0004",
        "parent_id": "CT001",
        "slug": "tabac",
        "name": "Tabac & vapotage",
        "level": 2,
        "sort_order": 4,
        "is_active": true,
        "requires_age_check": true,
        "tax_code": "TABAC-TPS-TVQ",
        "subcategories": [
          {
            "id": "SUB00020",
            "parent_id": "CAT0004",
            "slug": "cigarettes",
            "name": "Cigarettes",
            "level": 3,
            "sort_order": 20,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "TABAC-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000093",
                "name_fr": "paquets réguliers",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000094",
                "name_fr": "format king size",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000095",
                "name_fr": "cigarettes légères",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000096",
                "name_fr": "sans additifs",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00021",
            "parent_id": "CAT0004",
            "slug": "cigares",
            "name": "Cigares & cigarillos",
            "level": 3,
            "sort_order": 21,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "TABAC-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000097",
                "name_fr": "cigare",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000098",
                "name_fr": "cigarillo",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000099",
                "name_fr": "mini-cigare",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000100",
                "name_fr": "pipe à eau",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00022",
            "parent_id": "CAT0004",
            "slug": "tabac-rouler",
            "name": "Tabac à rouler",
            "level": 3,
            "sort_order": 22,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "TABAC-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000101",
                "name_fr": "tabac fin",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000102",
                "name_fr": "tabac blond",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000103",
                "name_fr": "papiers à rouler",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000104",
                "name_fr": "filtres",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000105",
                "name_fr": "machine à rouler",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00023",
            "parent_id": "CAT0004",
            "slug": "vapotage",
            "name": "Vapotage",
            "level": 3,
            "sort_order": 23,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "TABAC-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000106",
                "name_fr": "vape jetable",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000107",
                "name_fr": "pod rechargeable",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000108",
                "name_fr": "e-liquide fruits",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000109",
                "name_fr": "e-liquide menthe",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000110",
                "name_fr": "nicotine poche",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00024",
            "parent_id": "CAT0004",
            "slug": "allumettes",
            "name": "Briquets & allumettes",
            "level": 3,
            "sort_order": 24,
            "is_active": true,
            "requires_age_check": true,
            "tax_code": "TABAC-TPS-TVQ",
            "sample_items": [
              {
                "id": "ITEM000111",
                "name_fr": "briquet jetable",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000112",
                "name_fr": "briquet tempête",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000113",
                "name_fr": "allumettes longues",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0005",
        "parent_id": "CT001",
        "slug": "snacks",
        "name": "Collations & snacks",
        "level": 2,
        "sort_order": 5,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00025",
            "parent_id": "CAT0005",
            "slug": "chips",
            "name": "Chips & craquelins",
            "level": 3,
            "sort_order": 25,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000114",
                "name_fr": "chips barbecue",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000115",
                "name_fr": "chips sel",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000116",
                "name_fr": "craquelins fromage",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000117",
                "name_fr": "nachos",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000118",
                "name_fr": "pop-corn",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000119",
                "name_fr": "bretzels",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00026",
            "parent_id": "CAT0005",
            "slug": "chocolat",
            "name": "Chocolat & barres",
            "level": 3,
            "sort_order": 26,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000120",
                "name_fr": "chocolat au lait",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000121",
                "name_fr": "chocolat noir",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000122",
                "name_fr": "chocolat blanc",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000123",
                "name_fr": "barre caramel",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000124",
                "name_fr": "barre noisette",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000125",
                "name_fr": "Kit Kat",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000126",
                "name_fr": "Snickers",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00027",
            "parent_id": "CAT0005",
            "slug": "bonbons",
            "name": "Bonbons & friandises",
            "level": 3,
            "sort_order": 27,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000127",
                "name_fr": "jujubes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000128",
                "name_fr": "réglisse",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000129",
                "name_fr": "caramel dur",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000130",
                "name_fr": "sucette",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000131",
                "name_fr": "gomme",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000132",
                "name_fr": "mentos",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000133",
                "name_fr": "pastilles",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00028",
            "parent_id": "CAT0005",
            "slug": "noix",
            "name": "Noix & fruits secs",
            "level": 3,
            "sort_order": 28,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000134",
                "name_fr": "amandes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000135",
                "name_fr": "noix de cajou",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000136",
                "name_fr": "pistaches",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000137",
                "name_fr": "arachides",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000138",
                "name_fr": "mélange montagnard",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000139",
                "name_fr": "dattes",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000140",
                "name_fr": "raisins secs",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00029",
            "parent_id": "CAT0005",
            "slug": "sante-snack",
            "name": "Collations santé",
            "level": 3,
            "sort_order": 29,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000141",
                "name_fr": "barre protéinée",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000142",
                "name_fr": "barre granola",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000143",
                "name_fr": "galette de riz",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000144",
                "name_fr": "bouchées énergie",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000145",
                "name_fr": "chips légumes",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00030",
            "parent_id": "CAT0005",
            "slug": "gateaux-emballes",
            "name": "Gâteaux & biscuits emballés",
            "level": 3,
            "sort_order": 30,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000146",
                "name_fr": "biscuits oreo",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000147",
                "name_fr": "muffin emballé",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000148",
                "name_fr": "cake emballé",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000149",
                "name_fr": "mini donuts",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000150",
                "name_fr": "biscuits sablés",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0006",
        "parent_id": "CT001",
        "slug": "epicerie-generale",
        "name": "Épicerie générale",
        "level": 2,
        "sort_order": 6,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "ALIMENTAIRE-EXEMPT",
        "subcategories": [
          {
            "id": "SUB00031",
            "parent_id": "CAT0006",
            "slug": "pain-boulangerie",
            "name": "Pain & boulangerie",
            "level": 3,
            "sort_order": 31,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000151",
                "name_fr": "pain tranché blanc",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000152",
                "name_fr": "pain tranché blé",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000153",
                "name_fr": "baguette",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000154",
                "name_fr": "pain pita",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000155",
                "name_fr": "pain hot-dog",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000156",
                "name_fr": "pain hamburger",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000157",
                "name_fr": "bagel",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000158",
                "name_fr": "tortilla",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000159",
                "name_fr": "croissant emballé",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00032",
            "parent_id": "CAT0006",
            "slug": "lait-oeufs",
            "name": "Lait, œufs & beurre",
            "level": 3,
            "sort_order": 32,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000160",
                "name_fr": "lait 2%",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000161",
                "name_fr": "lait entier",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000162",
                "name_fr": "lait écrémé",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000163",
                "name_fr": "beurre salé",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000164",
                "name_fr": "beurre non salé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000165",
                "name_fr": "œufs blancs",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000166",
                "name_fr": "œufs bruns",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000167",
                "name_fr": "œufs oméga-3",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000168",
                "name_fr": "crème 15%",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000169",
                "name_fr": "crème 35%",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00033",
            "parent_id": "CAT0006",
            "slug": "fromages-epicerie",
            "name": "Fromages emballés",
            "level": 3,
            "sort_order": 33,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000170",
                "name_fr": "fromage cheddar",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000171",
                "name_fr": "fromage mozzarella",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000172",
                "name_fr": "fromage suisse",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000173",
                "name_fr": "fromage cottage",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000174",
                "name_fr": "fromage à la crème",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000175",
                "name_fr": "ricotta",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000176",
                "name_fr": "parmesan râpé",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000177",
                "name_fr": "fromage en tranches",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00034",
            "parent_id": "CAT0006",
            "slug": "yaourts",
            "name": "Yogourts & desserts laitiers",
            "level": 3,
            "sort_order": 34,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000178",
                "name_fr": "yogourt nature",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000179",
                "name_fr": "yogourt fruits",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000180",
                "name_fr": "yogourt grec",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000181",
                "name_fr": "yogourt à boire",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000182",
                "name_fr": "pudding",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000183",
                "name_fr": "crème dessert",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000184",
                "name_fr": "flan",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00035",
            "parent_id": "CAT0006",
            "slug": "charcuteries-epicerie",
            "name": "Charcuteries emballées",
            "level": 3,
            "sort_order": 35,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000185",
                "name_fr": "jambon tranché",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000186",
                "name_fr": "pepperoni",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000187",
                "name_fr": "salami",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000188",
                "name_fr": "bologne",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000189",
                "name_fr": "dinde tranchée",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000190",
                "name_fr": "poulet tranché",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000191",
                "name_fr": "saucisses breakfast",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000192",
                "name_fr": "hot-dogs emballés",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00036",
            "parent_id": "CAT0006",
            "slug": "conserves",
            "name": "Conserves & boîtes",
            "level": 3,
            "sort_order": 36,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000193",
                "name_fr": "soupe tomate",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000194",
                "name_fr": "soupe poulet",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000195",
                "name_fr": "thon en conserve",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000196",
                "name_fr": "saumon en conserve",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000197",
                "name_fr": "haricots rouges",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000198",
                "name_fr": "pois chiches",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000199",
                "name_fr": "maïs en conserve",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000200",
                "name_fr": "tomates en dés",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00037",
            "parent_id": "CAT0006",
            "slug": "pates-riz",
            "name": "Pâtes, riz & céréales",
            "level": 3,
            "sort_order": 37,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000201",
                "name_fr": "spaghetti",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000202",
                "name_fr": "penne",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000203",
                "name_fr": "fusilli",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000204",
                "name_fr": "riz blanc",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000205",
                "name_fr": "riz basmati",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000206",
                "name_fr": "riz brun",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000207",
                "name_fr": "couscous",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000208",
                "name_fr": "quinoa",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000209",
                "name_fr": "flocons d'avoine",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000210",
                "name_fr": "céréales matin",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00038",
            "parent_id": "CAT0006",
            "slug": "sauces-condiments",
            "name": "Sauces & condiments",
            "level": 3,
            "sort_order": 38,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000211",
                "name_fr": "ketchup",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000212",
                "name_fr": "moutarde",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000213",
                "name_fr": "mayonnaise",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000214",
                "name_fr": "sauce BBQ",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000215",
                "name_fr": "sauce soya",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000216",
                "name_fr": "huile d'olive",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000217",
                "name_fr": "vinaigre",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000218",
                "name_fr": "vinaigrette",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000219",
                "name_fr": "sauce Tabasco",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000220",
                "name_fr": "salsa",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00039",
            "parent_id": "CAT0006",
            "slug": "surgeles-epicerie",
            "name": "Surgelés",
            "level": 3,
            "sort_order": 39,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000221",
                "name_fr": "pizza surgelée",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000222",
                "name_fr": "frites surgelées",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000223",
                "name_fr": "légumes surgelés",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000224",
                "name_fr": "repas micro-onde",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000225",
                "name_fr": "pépites de poulet",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000226",
                "name_fr": "burgers surgelés",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000227",
                "name_fr": "dim sum surgelé",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000228",
                "name_fr": "glace emballée",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0007",
        "parent_id": "CT001",
        "slug": "hygiene-epicerie",
        "name": "Hygiène & ménager",
        "level": 2,
        "sort_order": 7,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "ALIMENTAIRE-EXEMPT",
        "subcategories": [
          {
            "id": "SUB00040",
            "parent_id": "CAT0007",
            "slug": "hygiene-corpo",
            "name": "Hygiène corporelle",
            "level": 3,
            "sort_order": 40,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000229",
                "name_fr": "savon mains",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000230",
                "name_fr": "shampoing",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000231",
                "name_fr": "revitalisant",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000232",
                "name_fr": "gel douche",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000233",
                "name_fr": "déodorant",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000234",
                "name_fr": "dentifrice",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000235",
                "name_fr": "brosse à dents",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000236",
                "name_fr": "rasoir jetable",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000237",
                "name_fr": "mousse à raser",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00041",
            "parent_id": "CAT0007",
            "slug": "feminin",
            "name": "Hygiène féminine",
            "level": 3,
            "sort_order": 41,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000238",
                "name_fr": "tampons",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000239",
                "name_fr": "serviettes hygiéniques",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000240",
                "name_fr": "protège-dessous",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000241",
                "name_fr": "coupe menstruelle",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00042",
            "parent_id": "CAT0007",
            "slug": "bebe-epicerie",
            "name": "Bébé & puériculture",
            "level": 3,
            "sort_order": 42,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000242",
                "name_fr": "couches nouveau-né",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000243",
                "name_fr": "couches taille 1-2-3-4-5-6",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000244",
                "name_fr": "lingettes bébé",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000245",
                "name_fr": "lait maternisé",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000246",
                "name_fr": "purée bébé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000247",
                "name_fr": "biberons",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000248",
                "name_fr": "sucettes",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000249",
                "name_fr": "crème pour bébé",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000250",
                "name_fr": "shampoing bébé",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000251",
                "name_fr": "lingettes désinfectantes bébé",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00043",
            "parent_id": "CAT0007",
            "slug": "menager",
            "name": "Produits ménagers",
            "level": 3,
            "sort_order": 43,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000252",
                "name_fr": "papier essuie-tout",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000253",
                "name_fr": "papier toilette",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000254",
                "name_fr": "sacs poubelle",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000255",
                "name_fr": "sacs ziploc",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000256",
                "name_fr": "film alimentaire",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000257",
                "name_fr": "aluminium",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000258",
                "name_fr": "liquide vaisselle",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000259",
                "name_fr": "savon machine",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000260",
                "name_fr": "nettoyant tout-usage",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000261",
                "name_fr": "désinfectant",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00044",
            "parent_id": "CAT0007",
            "slug": "pharmacie-base",
            "name": "Pharmacie de base",
            "level": 3,
            "sort_order": 44,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000262",
                "name_fr": "acétaminophène",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000263",
                "name_fr": "ibuprofène",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000264",
                "name_fr": "antiacide",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000265",
                "name_fr": "vitamine C",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000266",
                "name_fr": "pansements",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000267",
                "name_fr": "thermomètre",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000268",
                "name_fr": "antiseptique",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000269",
                "name_fr": "sirop toux",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000270",
                "name_fr": "antihistaminique",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000271",
                "name_fr": "test grossesse",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0008",
        "parent_id": "CT001",
        "slug": "loterie-journaux",
        "name": "Loterie & journaux",
        "level": 2,
        "sort_order": 8,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00045",
            "parent_id": "CAT0008",
            "slug": "loterie",
            "name": "Loterie",
            "level": 3,
            "sort_order": 45,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000272",
                "name_fr": "gratteux Lotto-Québec",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000273",
                "name_fr": "Lotto Max",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000274",
                "name_fr": "Lotto 6/49",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000275",
                "name_fr": "Extra",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000276",
                "name_fr": "banco",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000277",
                "name_fr": "Astro",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00046",
            "parent_id": "CAT0008",
            "slug": "journaux",
            "name": "Journaux & magazines",
            "level": 3,
            "sort_order": 46,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000278",
                "name_fr": "La Presse",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000279",
                "name_fr": "Le Journal de Montréal",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000280",
                "name_fr": "Metro",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000281",
                "name_fr": "magazines people",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000282",
                "name_fr": "magazines sport",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000283",
                "name_fr": "TV Hebdo",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00047",
            "parent_id": "CAT0008",
            "slug": "cartes-cadeaux",
            "name": "Cartes-cadeaux",
            "level": 3,
            "sort_order": 47,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000284",
                "name_fr": "carte iTunes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000285",
                "name_fr": "carte Google Play",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000286",
                "name_fr": "carte Steam",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000287",
                "name_fr": "carte Amazon",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000288",
                "name_fr": "carte PlayStation",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000289",
                "name_fr": "carte Xbox",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000290",
                "name_fr": "carte Netflix",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT002",
    "slug": "boulangerie-artisanale",
    "name": "Boulangerie artisanale",
    "level": 1,
    "sort_order": 2,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0009",
        "parent_id": "CT002",
        "slug": "pains",
        "name": "Pains",
        "level": 2,
        "sort_order": 9,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "ALIMENTAIRE-EXEMPT",
        "subcategories": [
          {
            "id": "SUB00048",
            "parent_id": "CAT0009",
            "slug": "pains-blancs",
            "name": "Pains blancs",
            "level": 3,
            "sort_order": 48,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000291",
                "name_fr": "baguette tradition",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000292",
                "name_fr": "pain blanc tranché",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000293",
                "name_fr": "pain de mie",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000294",
                "name_fr": "pain viennois",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000295",
                "name_fr": "ficelle",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000296",
                "name_fr": "flûte",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00049",
            "parent_id": "CAT0009",
            "slug": "pains-speciaux",
            "name": "Pains spéciaux",
            "level": 3,
            "sort_order": 49,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000297",
                "name_fr": "pain multigrains",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000298",
                "name_fr": "pain seigle",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000299",
                "name_fr": "pain kamut",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000300",
                "name_fr": "pain épeautre",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000301",
                "name_fr": "pain aux noix",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000302",
                "name_fr": "pain aux olives",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000303",
                "name_fr": "pain aux raisins",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000304",
                "name_fr": "pain de campagne",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000305",
                "name_fr": "pain brioché",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000306",
                "name_fr": "focaccia",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00050",
            "parent_id": "CAT0009",
            "slug": "pains-sans-gluten",
            "name": "Pains sans gluten",
            "level": 3,
            "sort_order": 50,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000307",
                "name_fr": "pain sans gluten tranché",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000308",
                "name_fr": "pain sans gluten graines",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000309",
                "name_fr": "pain riz sans gluten",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00051",
            "parent_id": "CAT0009",
            "slug": "pains-plats",
            "name": "Pains plats & pitas",
            "level": 3,
            "sort_order": 51,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000310",
                "name_fr": "pita blanc",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000311",
                "name_fr": "pita blé",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000312",
                "name_fr": "naan",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000313",
                "name_fr": "tortilla artisanale",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000314",
                "name_fr": "chapati",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000315",
                "name_fr": "lavash",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0010",
        "parent_id": "CT002",
        "slug": "viennoiseries",
        "name": "Viennoiseries",
        "level": 2,
        "sort_order": 10,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00052",
            "parent_id": "CAT0010",
            "slug": "croissants",
            "name": "Croissants",
            "level": 3,
            "sort_order": 52,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000316",
                "name_fr": "croissant beurre",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000317",
                "name_fr": "croissant amande",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000318",
                "name_fr": "croissant chocolat",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000319",
                "name_fr": "croissant jambon-fromage",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000320",
                "name_fr": "pain au chocolat",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00053",
            "parent_id": "CAT0010",
            "slug": "brioches",
            "name": "Brioches & chaussons",
            "level": 3,
            "sort_order": 53,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000321",
                "name_fr": "brioche tressée",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000322",
                "name_fr": "brioche roulée cannelle",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000323",
                "name_fr": "chausson aux pommes",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000324",
                "name_fr": "pain aux raisins",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000325",
                "name_fr": "chausson framboises",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00054",
            "parent_id": "CAT0010",
            "slug": "muffins",
            "name": "Muffins & scones",
            "level": 3,
            "sort_order": 54,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000326",
                "name_fr": "muffin bleuets",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000327",
                "name_fr": "muffin banane chocolat",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000328",
                "name_fr": "muffin son",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000329",
                "name_fr": "muffin citron pavot",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000330",
                "name_fr": "scone cannelle",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000331",
                "name_fr": "scone cranberry",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0011",
        "parent_id": "CT002",
        "slug": "patisseries-boulangerie",
        "name": "Pâtisseries",
        "level": 2,
        "sort_order": 11,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00055",
            "parent_id": "CAT0011",
            "slug": "gateaux-entiers",
            "name": "Gâteaux entiers",
            "level": 3,
            "sort_order": 55,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000332",
                "name_fr": "gâteau fromage",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000333",
                "name_fr": "gâteau chocolat",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000334",
                "name_fr": "gâteau vanille",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000335",
                "name_fr": "gâteau carotte",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000336",
                "name_fr": "gâteau citron",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000337",
                "name_fr": "gâteau anniversaire",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000338",
                "name_fr": "forêt noire",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00056",
            "parent_id": "CAT0011",
            "slug": "parts-gateaux",
            "name": "Parts & individuels",
            "level": 3,
            "sort_order": 56,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000339",
                "name_fr": "part de gâteau",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000340",
                "name_fr": "éclair chocolat",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000341",
                "name_fr": "religieuse",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000342",
                "name_fr": "millefeuille",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000343",
                "name_fr": "tarte aux fruits",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000344",
                "name_fr": "tartelette citron",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000345",
                "name_fr": "chou chantilly",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00057",
            "parent_id": "CAT0011",
            "slug": "biscuits-boulan",
            "name": "Biscuits artisanaux",
            "level": 3,
            "sort_order": 57,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000346",
                "name_fr": "macaron français",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000347",
                "name_fr": "sablé beurre",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000348",
                "name_fr": "cookie chocolat",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000349",
                "name_fr": "financier amande",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000350",
                "name_fr": "brownie",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000351",
                "name_fr": "biscotti café",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT003",
    "slug": "patisserie",
    "name": "Pâtisserie",
    "level": 1,
    "sort_order": 3,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0012",
        "parent_id": "CT003",
        "slug": "gateaux-patisserie",
        "name": "Gâteaux & entremets",
        "level": 2,
        "sort_order": 12,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00058",
            "parent_id": "CAT0012",
            "slug": "entremets",
            "name": "Entremets",
            "level": 3,
            "sort_order": 58,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000352",
                "name_fr": "entremet chocolat framboise",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000353",
                "name_fr": "entremet mangue passion",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000354",
                "name_fr": "entremet vanille caramel",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000355",
                "name_fr": "bûche de Noël",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000356",
                "name_fr": "charlotte aux fraises",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00059",
            "parent_id": "CAT0012",
            "slug": "gateaux-celebr",
            "name": "Gâteaux de célébration",
            "level": 3,
            "sort_order": 59,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000357",
                "name_fr": "gâteau anniversaire personnalisé",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000358",
                "name_fr": "gâteau mariage",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000359",
                "name_fr": "gâteau communion",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000360",
                "name_fr": "cupcakes décorés",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000361",
                "name_fr": "layer cake",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00060",
            "parent_id": "CAT0012",
            "slug": "tartes",
            "name": "Tartes & tartelettes",
            "level": 3,
            "sort_order": 60,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000362",
                "name_fr": "tarte aux fraises",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000363",
                "name_fr": "tarte citron meringuée",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000364",
                "name_fr": "tarte aux pommes",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000365",
                "name_fr": "tarte chocolat",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000366",
                "name_fr": "tarte frangipane",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000367",
                "name_fr": "tartelette framboises",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0013",
        "parent_id": "CT003",
        "slug": "chocolats-confiseries",
        "name": "Chocolats & confiseries",
        "level": 2,
        "sort_order": 13,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00061",
            "parent_id": "CAT0013",
            "slug": "tablettes",
            "name": "Tablettes de chocolat",
            "level": 3,
            "sort_order": 61,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000368",
                "name_fr": "tablette 70% cacao",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000369",
                "name_fr": "tablette lait noisettes",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000370",
                "name_fr": "tablette blanc framboise",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000371",
                "name_fr": "tablette origine Madagascar",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00062",
            "parent_id": "CAT0013",
            "slug": "bonbons-choco",
            "name": "Bonbons & truffes",
            "level": 3,
            "sort_order": 62,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000372",
                "name_fr": "truffe café",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000373",
                "name_fr": "truffe framboise",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000374",
                "name_fr": "bonbon praliné",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000375",
                "name_fr": "ganache pistache",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000376",
                "name_fr": "rocher chocolat",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000377",
                "name_fr": "mendiants",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00063",
            "parent_id": "CAT0013",
            "slug": "coffrets",
            "name": "Coffrets & cadeaux",
            "level": 3,
            "sort_order": 63,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000378",
                "name_fr": "coffret assortiment",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000379",
                "name_fr": "boîte de truffes",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000380",
                "name_fr": "panier gourmand",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000381",
                "name_fr": "coffret Saint-Valentin",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000382",
                "name_fr": "coffret Pâques",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0014",
        "parent_id": "CT003",
        "slug": "glaces-sorbets",
        "name": "Glaces & sorbets",
        "level": 2,
        "sort_order": 14,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00064",
            "parent_id": "CAT0014",
            "slug": "glaces-artis",
            "name": "Glaces artisanales",
            "level": 3,
            "sort_order": 64,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000383",
                "name_fr": "glace vanille bourbon",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000384",
                "name_fr": "glace chocolat belge",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000385",
                "name_fr": "glace pistache",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000386",
                "name_fr": "glace caramel sel",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000387",
                "name_fr": "glace fraise",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000388",
                "name_fr": "glace café",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000389",
                "name_fr": "glace noisette",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00065",
            "parent_id": "CAT0014",
            "slug": "sorbets",
            "name": "Sorbets",
            "level": 3,
            "sort_order": 65,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000390",
                "name_fr": "sorbet citron",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000391",
                "name_fr": "sorbet framboise",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000392",
                "name_fr": "sorbet mangue",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000393",
                "name_fr": "sorbet passion",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000394",
                "name_fr": "sorbet pastèque",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000395",
                "name_fr": "sorbet pomme verte",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00066",
            "parent_id": "CAT0014",
            "slug": "formats-glace",
            "name": "Formats",
            "level": 3,
            "sort_order": 66,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000396",
                "name_fr": "bac 500ml",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000397",
                "name_fr": "bac 1L",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000398",
                "name_fr": "bac 2L",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000399",
                "name_fr": "cornet artisanal",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000400",
                "name_fr": "coupe glacée",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000401",
                "name_fr": "esquimau",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000402",
                "name_fr": "sandwich glacé",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT004",
    "slug": "fleuriste",
    "name": "Fleuriste",
    "level": 1,
    "sort_order": 4,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0015",
        "parent_id": "CT004",
        "slug": "bouquets-fleurs",
        "name": "Bouquets & fleurs coupées",
        "level": 2,
        "sort_order": 15,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00067",
            "parent_id": "CAT0015",
            "slug": "roses",
            "name": "Roses",
            "level": 3,
            "sort_order": 67,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000403",
                "name_fr": "roses rouges",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000404",
                "name_fr": "roses roses",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000405",
                "name_fr": "roses blanches",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000406",
                "name_fr": "roses jaunes",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000407",
                "name_fr": "roses orange",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000408",
                "name_fr": "roses multicolores",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000409",
                "name_fr": "roses séchées",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00068",
            "parent_id": "CAT0015",
            "slug": "bouquets-mixtes",
            "name": "Bouquets mixtes",
            "level": 3,
            "sort_order": 68,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000410",
                "name_fr": "bouquet champêtre",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000411",
                "name_fr": "bouquet tropical",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000412",
                "name_fr": "bouquet romantique",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000413",
                "name_fr": "bouquet anniversaire",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000414",
                "name_fr": "bouquet mariage",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000415",
                "name_fr": "bouquet funèbre",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00069",
            "parent_id": "CAT0015",
            "slug": "fleurs-coupees",
            "name": "Fleurs coupées",
            "level": 3,
            "sort_order": 69,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000416",
                "name_fr": "tulipes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000417",
                "name_fr": "pivoines",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000418",
                "name_fr": "lis",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000419",
                "name_fr": "orchidées coupées",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000420",
                "name_fr": "tournesols",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000421",
                "name_fr": "freesias",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000422",
                "name_fr": "alstroémères",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000423",
                "name_fr": "chrysanthèmes",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000424",
                "name_fr": "marguerites",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000425",
                "name_fr": "lavande",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00070",
            "parent_id": "CAT0015",
            "slug": "arrangements",
            "name": "Arrangements floraux",
            "level": 3,
            "sort_order": 70,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000426",
                "name_fr": "arrangement centre de table",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000427",
                "name_fr": "couronne florale",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000428",
                "name_fr": "boutonniére",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000429",
                "name_fr": "composition funèbre",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000430",
                "name_fr": "arrangement baptême",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0016",
        "parent_id": "CT004",
        "slug": "plantes",
        "name": "Plantes",
        "level": 2,
        "sort_order": 16,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00071",
            "parent_id": "CAT0016",
            "slug": "plantes-interieur",
            "name": "Plantes d'intérieur",
            "level": 3,
            "sort_order": 71,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000431",
                "name_fr": "monstera",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000432",
                "name_fr": "pothos",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000433",
                "name_fr": "ficus",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000434",
                "name_fr": "dracaena",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000435",
                "name_fr": "calathea",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000436",
                "name_fr": "fougère",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000437",
                "name_fr": "palmier intérieur",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000438",
                "name_fr": "cactus",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000439",
                "name_fr": "succulentes",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000440",
                "name_fr": "orchidée en pot",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              },
              {
                "id": "ITEM000441",
                "name_fr": "broméliacée",
                "level": 4,
                "sort_order": 11,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00072",
            "parent_id": "CAT0016",
            "slug": "plantes-exterieur",
            "name": "Plantes d'extérieur",
            "level": 3,
            "sort_order": 72,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000442",
                "name_fr": "géraniums",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000443",
                "name_fr": "impatiens",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000444",
                "name_fr": "pétunias",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000445",
                "name_fr": "lavande en pot",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000446",
                "name_fr": "rosier en pot",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000447",
                "name_fr": "herbes aromatiques",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000448",
                "name_fr": "tomates cerise",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000449",
                "name_fr": "basilic",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00073",
            "parent_id": "CAT0016",
            "slug": "plantes-zen",
            "name": "Plantes zen & cadeaux",
            "level": 3,
            "sort_order": 73,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000450",
                "name_fr": "bonsaï",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000451",
                "name_fr": "bambou porte-bonheur",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000452",
                "name_fr": "plante kokedama",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000453",
                "name_fr": "terrarium",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000454",
                "name_fr": "air plant",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0017",
        "parent_id": "CT004",
        "slug": "accessoires-fleurs",
        "name": "Accessoires & entretien",
        "level": 2,
        "sort_order": 17,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00074",
            "parent_id": "CAT0017",
            "slug": "pots-vases",
            "name": "Pots & vases",
            "level": 3,
            "sort_order": 74,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000455",
                "name_fr": "vase en verre",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000456",
                "name_fr": "vase céramique",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000457",
                "name_fr": "pot terracotta",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000458",
                "name_fr": "cache-pot décoratif",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000459",
                "name_fr": "jardinière",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00075",
            "parent_id": "CAT0017",
            "slug": "entretien-plantes",
            "name": "Entretien des plantes",
            "level": 3,
            "sort_order": 75,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000460",
                "name_fr": "terreau universel",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000461",
                "name_fr": "terreau cactus",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000462",
                "name_fr": "engrais liquide",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000463",
                "name_fr": "engrais granulés",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000464",
                "name_fr": "substrat orchidée",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000465",
                "name_fr": "billes d'argile",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000466",
                "name_fr": "brumisateur",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00076",
            "parent_id": "CAT0017",
            "slug": "cadeaux-fleurs",
            "name": "Cadeaux & cartes",
            "level": 3,
            "sort_order": 76,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000467",
                "name_fr": "carte de souhaits",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000468",
                "name_fr": "ruban cadeau",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000469",
                "name_fr": "papier d'emballage",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000470",
                "name_fr": "ourson peluche",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000471",
                "name_fr": "bougie parfumée cadeau",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT005",
    "slug": "fruiterie-legumes",
    "name": "Fruiterie / Marchand de légumes",
    "level": 1,
    "sort_order": 5,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0018",
        "parent_id": "CT005",
        "slug": "fruits",
        "name": "Fruits",
        "level": 2,
        "sort_order": 18,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "ALIMENTAIRE-EXEMPT",
        "subcategories": [
          {
            "id": "SUB00077",
            "parent_id": "CAT0018",
            "slug": "fruits-locaux",
            "name": "Fruits locaux & saison",
            "level": 3,
            "sort_order": 77,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000472",
                "name_fr": "pommes Cortland",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000473",
                "name_fr": "pommes Honeycrisp",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000474",
                "name_fr": "poires",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000475",
                "name_fr": "prunes",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000476",
                "name_fr": "bleuets",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000477",
                "name_fr": "fraises Québec",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000478",
                "name_fr": "framboises",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000479",
                "name_fr": "cerises",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000480",
                "name_fr": "raisins verts",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000481",
                "name_fr": "raisins rouges",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00078",
            "parent_id": "CAT0018",
            "slug": "fruits-tropicaux",
            "name": "Fruits tropicaux",
            "level": 3,
            "sort_order": 78,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000482",
                "name_fr": "bananes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000483",
                "name_fr": "mangues",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000484",
                "name_fr": "ananas",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000485",
                "name_fr": "papayes",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000486",
                "name_fr": "goyaves",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000487",
                "name_fr": "litchis",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000488",
                "name_fr": "fruit de la passion",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000489",
                "name_fr": "ramboutan",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000490",
                "name_fr": "jackfruit",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00079",
            "parent_id": "CAT0018",
            "slug": "agrumes",
            "name": "Agrumes",
            "level": 3,
            "sort_order": 79,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000491",
                "name_fr": "oranges",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000492",
                "name_fr": "mandarines",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000493",
                "name_fr": "pamplemousses",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000494",
                "name_fr": "citrons",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000495",
                "name_fr": "limes",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000496",
                "name_fr": "clémentines",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000497",
                "name_fr": "pomelos",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00080",
            "parent_id": "CAT0018",
            "slug": "fruits-exotiques",
            "name": "Fruits exotiques",
            "level": 3,
            "sort_order": 80,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000498",
                "name_fr": "kiwis",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000499",
                "name_fr": "kakis",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000500",
                "name_fr": "grenades",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000501",
                "name_fr": "figues fraîches",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000502",
                "name_fr": "caramboles",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000503",
                "name_fr": "pitayas (dragon fruit)",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0019",
        "parent_id": "CT005",
        "slug": "legumes",
        "name": "Légumes",
        "level": 2,
        "sort_order": 19,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "ALIMENTAIRE-EXEMPT",
        "subcategories": [
          {
            "id": "SUB00081",
            "parent_id": "CAT0019",
            "slug": "legumes-feuilles",
            "name": "Légumes feuilles & salades",
            "level": 3,
            "sort_order": 81,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000504",
                "name_fr": "laitue romaine",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000505",
                "name_fr": "épinards",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000506",
                "name_fr": "roquette",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000507",
                "name_fr": "kale",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000508",
                "name_fr": "bette à carde",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000509",
                "name_fr": "chou",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000510",
                "name_fr": "chou frisé",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000511",
                "name_fr": "endives",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000512",
                "name_fr": "radicchio",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000513",
                "name_fr": "mâche",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00082",
            "parent_id": "CAT0019",
            "slug": "legumes-racines",
            "name": "Légumes racines",
            "level": 3,
            "sort_order": 82,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000514",
                "name_fr": "carottes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000515",
                "name_fr": "pommes de terre",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000516",
                "name_fr": "patates douces",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000517",
                "name_fr": "betteraves",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000518",
                "name_fr": "radis",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000519",
                "name_fr": "navets",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000520",
                "name_fr": "panais",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000521",
                "name_fr": "céleri-rave",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000522",
                "name_fr": "gingembre frais",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000523",
                "name_fr": "curcuma frais",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00083",
            "parent_id": "CAT0019",
            "slug": "legumes-fruits",
            "name": "Légumes-fruits",
            "level": 3,
            "sort_order": 83,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000524",
                "name_fr": "tomates cerises",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000525",
                "name_fr": "tomates rondes",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000526",
                "name_fr": "tomates allongées",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000527",
                "name_fr": "poivrons rouges",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000528",
                "name_fr": "poivrons verts",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000529",
                "name_fr": "concombres",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000530",
                "name_fr": "courgettes",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000531",
                "name_fr": "aubergines",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000532",
                "name_fr": "piments forts",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00084",
            "parent_id": "CAT0019",
            "slug": "legumes-bulbes",
            "name": "Oignons, aulx & herbes",
            "level": 3,
            "sort_order": 84,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000533",
                "name_fr": "oignons blancs",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000534",
                "name_fr": "oignons rouges",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000535",
                "name_fr": "échalotes",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000536",
                "name_fr": "ail blanc",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000537",
                "name_fr": "ail noir",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000538",
                "name_fr": "poireaux",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000539",
                "name_fr": "ciboulette",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000540",
                "name_fr": "persil",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000541",
                "name_fr": "basilic",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000542",
                "name_fr": "menthe fraîche",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              },
              {
                "id": "ITEM000543",
                "name_fr": "coriandre",
                "level": 4,
                "sort_order": 11,
                "is_active": true
              },
              {
                "id": "ITEM000544",
                "name_fr": "thym",
                "level": 4,
                "sort_order": 12,
                "is_active": true
              },
              {
                "id": "ITEM000545",
                "name_fr": "romarin",
                "level": 4,
                "sort_order": 13,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00085",
            "parent_id": "CAT0019",
            "slug": "champignons",
            "name": "Champignons",
            "level": 3,
            "sort_order": 85,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000546",
                "name_fr": "champignons blancs",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000547",
                "name_fr": "champignons portobello",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000548",
                "name_fr": "shiitake",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000549",
                "name_fr": "pleurotes",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000550",
                "name_fr": "chanterelles",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000551",
                "name_fr": "champignons cremini",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0020",
        "parent_id": "CT005",
        "slug": "jus-frais",
        "name": "Jus pressés & smoothies",
        "level": 2,
        "sort_order": 20,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00086",
            "parent_id": "CAT0020",
            "slug": "jus-presses",
            "name": "Jus pressés maison",
            "level": 3,
            "sort_order": 86,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000552",
                "name_fr": "jus orange fraîchement pressé",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000553",
                "name_fr": "jus pomme-carotte-gingembre",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000554",
                "name_fr": "jus betterave-pomme",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000555",
                "name_fr": "jus verts épinards-concombre",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000556",
                "name_fr": "jus tropical",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00087",
            "parent_id": "CAT0020",
            "slug": "smoothies",
            "name": "Smoothies & bowls",
            "level": 3,
            "sort_order": 87,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000557",
                "name_fr": "smoothie mangue-fraise",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000558",
                "name_fr": "smoothie vert kale",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000559",
                "name_fr": "smoothie protéiné banane",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000560",
                "name_fr": "açaí bowl",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000561",
                "name_fr": "smoothie bowl fruits",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT006",
    "slug": "boucherie",
    "name": "Boucherie",
    "level": 1,
    "sort_order": 6,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0021",
        "parent_id": "CT006",
        "slug": "boeuf",
        "name": "Bœuf",
        "level": 2,
        "sort_order": 21,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00088",
            "parent_id": "CAT0021",
            "slug": "steaks",
            "name": "Steaks & grillades",
            "level": 3,
            "sort_order": 88,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000562",
                "name_fr": "ribeye",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000563",
                "name_fr": "faux-filet",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000564",
                "name_fr": "filet mignon",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000565",
                "name_fr": "T-bone",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000566",
                "name_fr": "bavette",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000567",
                "name_fr": "entrecôte",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000568",
                "name_fr": "onglet",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000569",
                "name_fr": "rumsteak",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00089",
            "parent_id": "CAT0021",
            "slug": "boeuf-hache",
            "name": "Bœuf haché",
            "level": 3,
            "sort_order": 89,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000570",
                "name_fr": "bœuf haché maigre",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000571",
                "name_fr": "bœuf haché mi-maigre",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000572",
                "name_fr": "bœuf haché régulier",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000573",
                "name_fr": "galettes burger maison",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00090",
            "parent_id": "CAT0021",
            "slug": "boeuf-braises",
            "name": "Pièces à braiser",
            "level": 3,
            "sort_order": 90,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000574",
                "name_fr": "rôti de palette",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000575",
                "name_fr": "bœuf en cubes",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000576",
                "name_fr": "jarret de bœuf",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000577",
                "name_fr": "queue de bœuf",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000578",
                "name_fr": "flanc de bœuf",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0022",
        "parent_id": "CT006",
        "slug": "porc",
        "name": "Porc",
        "level": 2,
        "sort_order": 22,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00091",
            "parent_id": "CAT0022",
            "slug": "cotes-porc",
            "name": "Côtes & grillades",
            "level": 3,
            "sort_order": 91,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000579",
                "name_fr": "côtelettes de porc",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000580",
                "name_fr": "côtes levées",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000581",
                "name_fr": "côtes back ribs",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000582",
                "name_fr": "longe de porc",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000583",
                "name_fr": "filet de porc",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00092",
            "parent_id": "CAT0022",
            "slug": "saucisses-maison",
            "name": "Saucisses maison",
            "level": 3,
            "sort_order": 92,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000584",
                "name_fr": "saucisses au fromage",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000585",
                "name_fr": "saucisses aux herbes",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000586",
                "name_fr": "merguez",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000587",
                "name_fr": "chorizo maison",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000588",
                "name_fr": "saucisses breakfast",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000589",
                "name_fr": "boudin",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00093",
            "parent_id": "CAT0022",
            "slug": "porc-divers",
            "name": "Divers porc",
            "level": 3,
            "sort_order": 93,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000590",
                "name_fr": "bacon artisanal",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000591",
                "name_fr": "jambon non-tranché",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000592",
                "name_fr": "épaule de porc",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000593",
                "name_fr": "rôti de porc",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000594",
                "name_fr": "jarret de porc fumé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0023",
        "parent_id": "CT006",
        "slug": "volaille",
        "name": "Volaille",
        "level": 2,
        "sort_order": 23,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00094",
            "parent_id": "CAT0023",
            "slug": "poulet",
            "name": "Poulet",
            "level": 3,
            "sort_order": 94,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000595",
                "name_fr": "poitrines de poulet",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000596",
                "name_fr": "cuisses de poulet",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000597",
                "name_fr": "pilons",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000598",
                "name_fr": "ailes de poulet",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000599",
                "name_fr": "poulet entier",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000600",
                "name_fr": "poulet haché",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000601",
                "name_fr": "escalopes de poulet",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00095",
            "parent_id": "CAT0023",
            "slug": "dinde-canard",
            "name": "Dinde & canard",
            "level": 3,
            "sort_order": 95,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000602",
                "name_fr": "dinde entière",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000603",
                "name_fr": "poitrines de dinde",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000604",
                "name_fr": "magret de canard",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000605",
                "name_fr": "cuisses de canard",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000606",
                "name_fr": "canard entier",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000607",
                "name_fr": "foie gras",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0024",
        "parent_id": "CT006",
        "slug": "agneau-veau",
        "name": "Agneau & veau",
        "level": 2,
        "sort_order": 24,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00096",
            "parent_id": "CAT0024",
            "slug": "agneau",
            "name": "Agneau",
            "level": 3,
            "sort_order": 96,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000608",
                "name_fr": "côtelettes d'agneau",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000609",
                "name_fr": "gigot d'agneau",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000610",
                "name_fr": "épaule d'agneau",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000611",
                "name_fr": "carré d'agneau",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000612",
                "name_fr": "agneau haché",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00097",
            "parent_id": "CAT0024",
            "slug": "veau",
            "name": "Veau",
            "level": 3,
            "sort_order": 97,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000613",
                "name_fr": "escalopes de veau",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000614",
                "name_fr": "côtelettes de veau",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000615",
                "name_fr": "jarret de veau",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000616",
                "name_fr": "foie de veau",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000617",
                "name_fr": "ris de veau",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0025",
        "parent_id": "CT006",
        "slug": "marinades-boucherie",
        "name": "Marinades & produits maison",
        "level": 2,
        "sort_order": 25,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00098",
            "parent_id": "CAT0025",
            "slug": "marinades",
            "name": "Viandes marinées",
            "level": 3,
            "sort_order": 98,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000618",
                "name_fr": "poulet mariné ail-herbes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000619",
                "name_fr": "bœuf mariné teriyaki",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000620",
                "name_fr": "porc mariné barbecue",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000621",
                "name_fr": "brochettes marinées",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000622",
                "name_fr": "kabobs",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00099",
            "parent_id": "CAT0025",
            "slug": "charcuterie-maison",
            "name": "Charcuterie maison",
            "level": 3,
            "sort_order": 99,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000623",
                "name_fr": "pâté de campagne",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000624",
                "name_fr": "terrine de viande",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000625",
                "name_fr": "rillettes",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000626",
                "name_fr": "foie haché",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT007",
    "slug": "poissonnerie",
    "name": "Poissonnerie",
    "level": 1,
    "sort_order": 7,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0026",
        "parent_id": "CT007",
        "slug": "poissons-frais",
        "name": "Poissons frais",
        "level": 2,
        "sort_order": 26,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "ALIMENTAIRE-EXEMPT",
        "subcategories": [
          {
            "id": "SUB00100",
            "parent_id": "CAT0026",
            "slug": "poissons-atlantique",
            "name": "Poissons de l'Atlantique",
            "level": 3,
            "sort_order": 100,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000627",
                "name_fr": "saumon entier",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000628",
                "name_fr": "filets de saumon",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000629",
                "name_fr": "morue fraîche",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000630",
                "name_fr": "aiglefin",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000631",
                "name_fr": "flétan",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000632",
                "name_fr": "turbot",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000633",
                "name_fr": "maquereau",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000634",
                "name_fr": "hareng",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00101",
            "parent_id": "CAT0026",
            "slug": "poissons-eau-douce",
            "name": "Poissons d'eau douce",
            "level": 3,
            "sort_order": 101,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000635",
                "name_fr": "truite arc-en-ciel",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000636",
                "name_fr": "doré du Québec",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000637",
                "name_fr": "brochet",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000638",
                "name_fr": "perche",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000639",
                "name_fr": "achigan",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000640",
                "name_fr": "esturgeon",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00102",
            "parent_id": "CAT0026",
            "slug": "poissons-exotiques",
            "name": "Poissons exotiques",
            "level": 3,
            "sort_order": 102,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000641",
                "name_fr": "tilapia",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000642",
                "name_fr": "vivaneau",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000643",
                "name_fr": "daurade",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000644",
                "name_fr": "bar",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000645",
                "name_fr": "thon frais",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000646",
                "name_fr": "espadon",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0027",
        "parent_id": "CT007",
        "slug": "fruits-mer",
        "name": "Fruits de mer",
        "level": 2,
        "sort_order": 27,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "ALIMENTAIRE-EXEMPT",
        "subcategories": [
          {
            "id": "SUB00103",
            "parent_id": "CAT0027",
            "slug": "crustaces",
            "name": "Crustacés",
            "level": 3,
            "sort_order": 103,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000647",
                "name_fr": "homard vivant",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000648",
                "name_fr": "homard cuit",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000649",
                "name_fr": "crabe des neiges",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000650",
                "name_fr": "crevettes fraîches",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000651",
                "name_fr": "langoustines",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000652",
                "name_fr": "écrevisses",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000653",
                "name_fr": "langouste",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00104",
            "parent_id": "CAT0027",
            "slug": "mollusques",
            "name": "Mollusques & coquillages",
            "level": 3,
            "sort_order": 104,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000654",
                "name_fr": "huîtres fraîches",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000655",
                "name_fr": "moules",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000656",
                "name_fr": "palourdes",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000657",
                "name_fr": "pétoncles",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000658",
                "name_fr": "calmars",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000659",
                "name_fr": "pieuvre",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000660",
                "name_fr": "escargots de mer",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0028",
        "parent_id": "CT007",
        "slug": "poissons-fumes",
        "name": "Poissons fumés & marinés",
        "level": 2,
        "sort_order": 28,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "ALIMENTAIRE-EXEMPT",
        "subcategories": [
          {
            "id": "SUB00105",
            "parent_id": "CAT0028",
            "slug": "fumes",
            "name": "Poissons fumés",
            "level": 3,
            "sort_order": 105,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000661",
                "name_fr": "saumon fumé",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000662",
                "name_fr": "truite fumée",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000663",
                "name_fr": "hareng fumé",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000664",
                "name_fr": "morue salée",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000665",
                "name_fr": "anguille fumée",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000666",
                "name_fr": "maquereau fumé",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00106",
            "parent_id": "CAT0028",
            "slug": "sushis-ingredients",
            "name": "Ingrédients sushis",
            "level": 3,
            "sort_order": 106,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "ALIMENTAIRE-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000667",
                "name_fr": "saumon sushi grade",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000668",
                "name_fr": "thon sushi grade",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000669",
                "name_fr": "riz sushi",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000670",
                "name_fr": "nori",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000671",
                "name_fr": "wasabi",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000672",
                "name_fr": "gingembre mariné",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT008",
    "slug": "fromagerie",
    "name": "Fromagerie",
    "level": 1,
    "sort_order": 8,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0029",
        "parent_id": "CT008",
        "slug": "fromages-quebec",
        "name": "Fromages québécois",
        "level": 2,
        "sort_order": 29,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00107",
            "parent_id": "CAT0029",
            "slug": "pates-fraiches",
            "name": "Pâtes fraîches",
            "level": 3,
            "sort_order": 107,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000673",
                "name_fr": "fromage en grains (cheddar frais)",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000674",
                "name_fr": "ricotta artisanale",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000675",
                "name_fr": "fromage cottage",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000676",
                "name_fr": "cream cheese local",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000677",
                "name_fr": "quark",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000678",
                "name_fr": "chèvre frais",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00108",
            "parent_id": "CAT0029",
            "slug": "pates-molles",
            "name": "Pâtes molles",
            "level": 3,
            "sort_order": 108,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000679",
                "name_fr": "brie québécois",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000680",
                "name_fr": "camembert local",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000681",
                "name_fr": "oka classique",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000682",
                "name_fr": "le Migneron",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000683",
                "name_fr": "le Baluchon",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000684",
                "name_fr": "tomme de Grosse-Île",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00109",
            "parent_id": "CAT0029",
            "slug": "pates-dures-qc",
            "name": "Pâtes dures locales",
            "level": 3,
            "sort_order": 109,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000685",
                "name_fr": "cheddar vieilli 2 ans",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000686",
                "name_fr": "cheddar vieilli 5 ans",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000687",
                "name_fr": "gruyère artisanal",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000688",
                "name_fr": "comté québécois",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000689",
                "name_fr": "parmesan artisanal",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0030",
        "parent_id": "CT008",
        "slug": "fromages-importes",
        "name": "Fromages importés",
        "level": 2,
        "sort_order": 30,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00110",
            "parent_id": "CAT0030",
            "slug": "fromages-france",
            "name": "France",
            "level": 3,
            "sort_order": 110,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000690",
                "name_fr": "comté AOP",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000691",
                "name_fr": "roquefort",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000692",
                "name_fr": "époisses",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000693",
                "name_fr": "munster",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000694",
                "name_fr": "reblochon",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000695",
                "name_fr": "beaufort",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000696",
                "name_fr": "tomme de Savoie",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00111",
            "parent_id": "CAT0030",
            "slug": "fromages-italie",
            "name": "Italie",
            "level": 3,
            "sort_order": 111,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000697",
                "name_fr": "parmigiano reggiano",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000698",
                "name_fr": "grana padano",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000699",
                "name_fr": "pecorino",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000700",
                "name_fr": "gorgonzola",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000701",
                "name_fr": "taleggio",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000702",
                "name_fr": "asiago",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000703",
                "name_fr": "provolone",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00112",
            "parent_id": "CAT0030",
            "slug": "fromages-autres",
            "name": "Autres pays",
            "level": 3,
            "sort_order": 112,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000704",
                "name_fr": "gouda vieux",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000705",
                "name_fr": "edam",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000706",
                "name_fr": "manchego",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000707",
                "name_fr": "halloumi",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000708",
                "name_fr": "feta grecque",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000709",
                "name_fr": "gruyère suisse",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0031",
        "parent_id": "CT008",
        "slug": "accompagnements-fromagerie",
        "name": "Accompagnements",
        "level": 2,
        "sort_order": 31,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00113",
            "parent_id": "CAT0031",
            "slug": "crackers",
            "name": "Crackers & pains",
            "level": 3,
            "sort_order": 113,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000710",
                "name_fr": "crackers fins",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000711",
                "name_fr": "pain aux noix",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000712",
                "name_fr": "grissini",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000713",
                "name_fr": "crackers sésame",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000714",
                "name_fr": "lavosh",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00114",
            "parent_id": "CAT0031",
            "slug": "confits",
            "name": "Confitures & condiments",
            "level": 3,
            "sort_order": 114,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000715",
                "name_fr": "confiture figue",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000716",
                "name_fr": "miel artisanal",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000717",
                "name_fr": "gelée de pommes",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000718",
                "name_fr": "confit d'oignons",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000719",
                "name_fr": "chutney mangue",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000720",
                "name_fr": "raisins marinés",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT009",
    "slug": "pharmacie-independante",
    "name": "Pharmacie indépendante",
    "level": 1,
    "sort_order": 9,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0032",
        "parent_id": "CT009",
        "slug": "medicaments-sans-ordonnance",
        "name": "Médicaments sans ordonnance",
        "level": 2,
        "sort_order": 32,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "MEDICAMENTS-EXEMPT",
        "subcategories": [
          {
            "id": "SUB00115",
            "parent_id": "CAT0032",
            "slug": "douleur",
            "name": "Douleur & fièvre",
            "level": 3,
            "sort_order": 115,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "MEDICAMENTS-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000721",
                "name_fr": "acétaminophène 500mg",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000722",
                "name_fr": "ibuprofène 200mg",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000723",
                "name_fr": "aspirine",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000724",
                "name_fr": "naproxène",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000725",
                "name_fr": "gel analgésique topique",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00116",
            "parent_id": "CAT0032",
            "slug": "rhume-allergie",
            "name": "Rhume, grippe & allergies",
            "level": 3,
            "sort_order": 116,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "MEDICAMENTS-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000726",
                "name_fr": "antihistaminique",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000727",
                "name_fr": "décongestionnant",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000728",
                "name_fr": "sirop toux adulte",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000729",
                "name_fr": "sirop toux enfant",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000730",
                "name_fr": "pastilles gorge",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000731",
                "name_fr": "spray nasal salin",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000732",
                "name_fr": "NyQuil",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000733",
                "name_fr": "DayQuil",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00117",
            "parent_id": "CAT0032",
            "slug": "estomac",
            "name": "Estomac & digestion",
            "level": 3,
            "sort_order": 117,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "MEDICAMENTS-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000734",
                "name_fr": "antiacide",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000735",
                "name_fr": "anti-nausée",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000736",
                "name_fr": "laxatif",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000737",
                "name_fr": "antidiarrhéique",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000738",
                "name_fr": "probiotiques",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000739",
                "name_fr": "enzymes digestives",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000740",
                "name_fr": "Pepto-Bismol",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00118",
            "parent_id": "CAT0032",
            "slug": "vitamines",
            "name": "Vitamines & suppléments",
            "level": 3,
            "sort_order": 118,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "MEDICAMENTS-EXEMPT",
            "sample_items": [
              {
                "id": "ITEM000741",
                "name_fr": "vitamine C",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000742",
                "name_fr": "vitamine D",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000743",
                "name_fr": "vitamine B12",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000744",
                "name_fr": "oméga-3",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000745",
                "name_fr": "multivitamines",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000746",
                "name_fr": "magnésium",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000747",
                "name_fr": "zinc",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000748",
                "name_fr": "fer",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000749",
                "name_fr": "calcium",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM000750",
                "name_fr": "probiotiques premium",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0033",
        "parent_id": "CT009",
        "slug": "soins-premiers-secours",
        "name": "Soins & premiers secours",
        "level": 2,
        "sort_order": 33,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00119",
            "parent_id": "CAT0033",
            "slug": "pansements",
            "name": "Pansements & bandages",
            "level": 3,
            "sort_order": 119,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000751",
                "name_fr": "pansements standard",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000752",
                "name_fr": "pansements imperméables",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000753",
                "name_fr": "bandages élastiques",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000754",
                "name_fr": "compresses stériles",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000755",
                "name_fr": "sparadrap",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000756",
                "name_fr": "filet tubulaire",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00120",
            "parent_id": "CAT0033",
            "slug": "antiseptiques",
            "name": "Antiseptiques & désinfectants",
            "level": 3,
            "sort_order": 120,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000757",
                "name_fr": "alcool isopropylique",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000758",
                "name_fr": "peroxyde d'hydrogène",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000759",
                "name_fr": "iode",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000760",
                "name_fr": "chlorhexidine",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000761",
                "name_fr": "spray désinfectant plaies",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00121",
            "parent_id": "CAT0033",
            "slug": "thermometres",
            "name": "Thermomètres & tensiomètres",
            "level": 3,
            "sort_order": 121,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000762",
                "name_fr": "thermomètre frontal",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000763",
                "name_fr": "thermomètre auriculaire",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000764",
                "name_fr": "tensiomètre poignet",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000765",
                "name_fr": "oxymètre de pouls",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000766",
                "name_fr": "glucomètre",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0034",
        "parent_id": "CT009",
        "slug": "hygiene-sante",
        "name": "Hygiène & beauté santé",
        "level": 2,
        "sort_order": 34,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00122",
            "parent_id": "CAT0034",
            "slug": "soins-peau",
            "name": "Soins peau & solaires",
            "level": 3,
            "sort_order": 122,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000767",
                "name_fr": "crème solaire SPF 30",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000768",
                "name_fr": "crème solaire SPF 60",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000769",
                "name_fr": "après-soleil",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000770",
                "name_fr": "crème hydratante",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000771",
                "name_fr": "crème anti-âge",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000772",
                "name_fr": "sérum vitamine C",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000773",
                "name_fr": "baume lèvres",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00123",
            "parent_id": "CAT0034",
            "slug": "contraception",
            "name": "Contraception & tests",
            "level": 3,
            "sort_order": 123,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000774",
                "name_fr": "condoms réguliers",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000775",
                "name_fr": "condoms XL",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000776",
                "name_fr": "lubrifiant",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000777",
                "name_fr": "test de grossesse",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000778",
                "name_fr": "test d'ovulation",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT010",
    "slug": "boutique-bebe",
    "name": "Boutique bébé & puériculture",
    "level": 1,
    "sort_order": 10,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0035",
        "parent_id": "CT010",
        "slug": "couches-hygiene-bebe",
        "name": "Couches & hygiène bébé",
        "level": 2,
        "sort_order": 35,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00124",
            "parent_id": "CAT0035",
            "slug": "couches-jetables",
            "name": "Couches jetables",
            "level": 3,
            "sort_order": 124,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000779",
                "name_fr": "couches nouveau-né (NB)",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000780",
                "name_fr": "couches taille 1",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000781",
                "name_fr": "couches taille 2",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000782",
                "name_fr": "couches taille 3",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000783",
                "name_fr": "couches taille 4",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000784",
                "name_fr": "couches taille 5",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000785",
                "name_fr": "couches taille 6",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000786",
                "name_fr": "couches nuit",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000787",
                "name_fr": "couches piscine",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00125",
            "parent_id": "CAT0035",
            "slug": "couches-tissu",
            "name": "Couches lavables",
            "level": 3,
            "sort_order": 125,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000788",
                "name_fr": "couches lavables AIO",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000789",
                "name_fr": "couches lavables pocket",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000790",
                "name_fr": "inserts bambou",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000791",
                "name_fr": "couches préfold",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000792",
                "name_fr": "langes",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00126",
            "parent_id": "CAT0035",
            "slug": "lingettes-bebe",
            "name": "Lingettes & produits change",
            "level": 3,
            "sort_order": 126,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000793",
                "name_fr": "lingettes sans parfum",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000794",
                "name_fr": "lingettes biodégradables",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000795",
                "name_fr": "crème anti-érythème",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000796",
                "name_fr": "poudre bébé",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000797",
                "name_fr": "huile bébé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000798",
                "name_fr": "gel nettoyant cordon",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0036",
        "parent_id": "CT010",
        "slug": "alimentation-bebe",
        "name": "Alimentation bébé",
        "level": 2,
        "sort_order": 36,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00127",
            "parent_id": "CAT0036",
            "slug": "lait-maternise",
            "name": "Lait maternisé",
            "level": 3,
            "sort_order": 127,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000799",
                "name_fr": "lait 1er âge (0-6 mois)",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000800",
                "name_fr": "lait 2e âge (6-12 mois)",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000801",
                "name_fr": "lait de croissance",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000802",
                "name_fr": "lait HA hypoallergénique",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000803",
                "name_fr": "lait sans lactose",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000804",
                "name_fr": "lait à base de soya",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00128",
            "parent_id": "CAT0036",
            "slug": "aliments-bebe",
            "name": "Purées & aliments",
            "level": 3,
            "sort_order": 128,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000805",
                "name_fr": "purée légumes maison",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000806",
                "name_fr": "purée fruits maison",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000807",
                "name_fr": "petit pot légumes",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000808",
                "name_fr": "petit pot fruits",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000809",
                "name_fr": "céréales bébé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000810",
                "name_fr": "petits gâteaux bébé",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000811",
                "name_fr": "snacks dissoluble bébé",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00129",
            "parent_id": "CAT0036",
            "slug": "biberons-accessoires",
            "name": "Biberons & accessoires repas",
            "level": 3,
            "sort_order": 129,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000812",
                "name_fr": "biberon verre",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000813",
                "name_fr": "biberon plastique sans BPA",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000814",
                "name_fr": "tétine silicone",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000815",
                "name_fr": "chauffe-biberon",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000816",
                "name_fr": "stérilisateur",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000817",
                "name_fr": "tire-lait",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000818",
                "name_fr": "couverts bébé",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000819",
                "name_fr": "assiette ventouse",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000820",
                "name_fr": "bavoir imperméable",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0037",
        "parent_id": "CT010",
        "slug": "vetements-bebe",
        "name": "Vêtements bébé",
        "level": 2,
        "sort_order": 37,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00130",
            "parent_id": "CAT0037",
            "slug": "pyjamas",
            "name": "Pyjamas & dors-bien",
            "level": 3,
            "sort_order": 130,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000821",
                "name_fr": "pyjama 0-3 mois",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000822",
                "name_fr": "pyjama 3-6 mois",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000823",
                "name_fr": "pyjama 6-12 mois",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000824",
                "name_fr": "gigoteuse été",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000825",
                "name_fr": "gigoteuse hiver",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000826",
                "name_fr": "grenouillère",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00131",
            "parent_id": "CAT0037",
            "slug": "tenues-bebe",
            "name": "Tenues quotidiennes",
            "level": 3,
            "sort_order": 131,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000827",
                "name_fr": "bodys manches courtes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000828",
                "name_fr": "bodys manches longues",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000829",
                "name_fr": "pantalons bébé",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000830",
                "name_fr": "robes bébé",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000831",
                "name_fr": "ensemble 2 pièces",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000832",
                "name_fr": "chaussettes antidérapantes",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000833",
                "name_fr": "chaussons bébé",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00132",
            "parent_id": "CAT0037",
            "slug": "hiver-bebe",
            "name": "Habits hiver",
            "level": 3,
            "sort_order": 132,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000834",
                "name_fr": "manteau bébé hiver",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000835",
                "name_fr": "habit de neige",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000836",
                "name_fr": "tuque laine",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000837",
                "name_fr": "mitaines",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000838",
                "name_fr": "bottes hiver bébé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0038",
        "parent_id": "CT010",
        "slug": "soins-eveil",
        "name": "Soins & éveil",
        "level": 2,
        "sort_order": 38,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00133",
            "parent_id": "CAT0038",
            "slug": "soins-bebe",
            "name": "Soins corporels bébé",
            "level": 3,
            "sort_order": 133,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000839",
                "name_fr": "shampoing bébé",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000840",
                "name_fr": "gel lavant bébé",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000841",
                "name_fr": "crème hydratante bébé",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000842",
                "name_fr": "lotion corps bébé",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000843",
                "name_fr": "coton-tiges bébé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000844",
                "name_fr": "mouche-bébé",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000845",
                "name_fr": "kit soins ongles bébé",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000846",
                "name_fr": "thermomètre bain",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00134",
            "parent_id": "CAT0038",
            "slug": "jouets-eveil",
            "name": "Jouets & éveil",
            "level": 3,
            "sort_order": 134,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000847",
                "name_fr": "hochets",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000848",
                "name_fr": "tapis d'éveil",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000849",
                "name_fr": "mobile musical",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000850",
                "name_fr": "anneau dentition",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000851",
                "name_fr": "livre tissu",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000852",
                "name_fr": "balles sensorielles",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000853",
                "name_fr": "portique d'activités",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000854",
                "name_fr": "fauteuil rebondisseur",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00135",
            "parent_id": "CAT0038",
            "slug": "securite-bebe",
            "name": "Sécurité",
            "level": 3,
            "sort_order": 135,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000855",
                "name_fr": "moniteur bébé audio",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000856",
                "name_fr": "moniteur bébé vidéo",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000857",
                "name_fr": "barrière sécurité",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000858",
                "name_fr": "protège-coins",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000859",
                "name_fr": "cache-prise électrique",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000860",
                "name_fr": "loquet armoire",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT011",
    "slug": "epicerie-bio-vrac",
    "name": "Épicerie bio & vrac",
    "level": 1,
    "sort_order": 11,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0039",
        "parent_id": "CT011",
        "slug": "vrac-sec",
        "name": "Vrac alimentaire sec",
        "level": 2,
        "sort_order": 39,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00136",
            "parent_id": "CAT0039",
            "slug": "cereales-vrac",
            "name": "Céréales & grains",
            "level": 3,
            "sort_order": 136,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000861",
                "name_fr": "flocons d'avoine",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000862",
                "name_fr": "quinoa",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000863",
                "name_fr": "millet",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000864",
                "name_fr": "sarrasin",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000865",
                "name_fr": "épeautre",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000866",
                "name_fr": "orge mondé",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000867",
                "name_fr": "riz sauvage",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000868",
                "name_fr": "riz basmati bio",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000869",
                "name_fr": "semoule",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00137",
            "parent_id": "CAT0039",
            "slug": "legumineuses-vrac",
            "name": "Légumineuses",
            "level": 3,
            "sort_order": 137,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000870",
                "name_fr": "lentilles vertes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000871",
                "name_fr": "lentilles rouges",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000872",
                "name_fr": "pois chiches",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000873",
                "name_fr": "haricots noirs",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000874",
                "name_fr": "haricots rouges",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000875",
                "name_fr": "haricots blancs",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000876",
                "name_fr": "fèves",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000877",
                "name_fr": "pois cassés",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00138",
            "parent_id": "CAT0039",
            "slug": "noix-vrac",
            "name": "Noix & graines",
            "level": 3,
            "sort_order": 138,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000878",
                "name_fr": "amandes crues",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000879",
                "name_fr": "noix de cajou",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000880",
                "name_fr": "noix de Grenoble",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000881",
                "name_fr": "pacanes",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000882",
                "name_fr": "graines de tournesol",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000883",
                "name_fr": "graines de citrouille",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000884",
                "name_fr": "graines de lin",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000885",
                "name_fr": "graines de chia",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000886",
                "name_fr": "chanvre",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00139",
            "parent_id": "CAT0039",
            "slug": "sucres-vrac",
            "name": "Sucres & farines",
            "level": 3,
            "sort_order": 139,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000887",
                "name_fr": "farine tout-usage bio",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000888",
                "name_fr": "farine blé entier",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000889",
                "name_fr": "farine de riz",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000890",
                "name_fr": "farine d'amande",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000891",
                "name_fr": "sucre brut",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000892",
                "name_fr": "sucre de coco",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000893",
                "name_fr": "sirop d'agave",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000894",
                "name_fr": "erythritol",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000895",
                "name_fr": "xylitol",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0040",
        "parent_id": "CT011",
        "slug": "produits-bio",
        "name": "Produits certifiés bio",
        "level": 2,
        "sort_order": 40,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00140",
            "parent_id": "CAT0040",
            "slug": "epicerie-bio-emballee",
            "name": "Épicerie bio emballée",
            "level": 3,
            "sort_order": 140,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000896",
                "name_fr": "pâtes bio",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000897",
                "name_fr": "riz bio",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000898",
                "name_fr": "sauce tomate bio",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000899",
                "name_fr": "huile d'olive bio",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000900",
                "name_fr": "vinaigre de cidre bio",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000901",
                "name_fr": "tamari",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000902",
                "name_fr": "miso",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000903",
                "name_fr": "tahini",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00141",
            "parent_id": "CAT0040",
            "slug": "snacks-bio",
            "name": "Collations bio",
            "level": 3,
            "sort_order": 141,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000904",
                "name_fr": "barre céréales bio",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000905",
                "name_fr": "chips légumes bio",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000906",
                "name_fr": "craquelins bio",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000907",
                "name_fr": "noix mélangées bio",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000908",
                "name_fr": "dattes Medjool",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000909",
                "name_fr": "abricots secs bio",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0041",
        "parent_id": "CT011",
        "slug": "produits-maison-ecolo",
        "name": "Produits ménagers écolos",
        "level": 2,
        "sort_order": 41,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00142",
            "parent_id": "CAT0041",
            "slug": "nettoyants-eco",
            "name": "Nettoyants écolos",
            "level": 3,
            "sort_order": 142,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000910",
                "name_fr": "savon liquide sans phosphate",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000911",
                "name_fr": "nettoyant multi-surfaces naturel",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000912",
                "name_fr": "vinaigre blanc ménager",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000913",
                "name_fr": "bicarbonate soude",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000914",
                "name_fr": "cristaux de soude",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000915",
                "name_fr": "gel douche solide",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00143",
            "parent_id": "CAT0041",
            "slug": "zero-dechet",
            "name": "Zéro déchet",
            "level": 3,
            "sort_order": 143,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000916",
                "name_fr": "shampoing solide",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000917",
                "name_fr": "conditionneur solide",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000918",
                "name_fr": "savon menstruel",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000919",
                "name_fr": "déodorant naturel",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000920",
                "name_fr": "brosse à dents bambou",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000921",
                "name_fr": "cotons lavables",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000922",
                "name_fr": "filets à fruits",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000923",
                "name_fr": "sacs réutilisables vrac",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM000924",
                "name_fr": "cire d'abeille emballage",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT012",
    "slug": "traiteur",
    "name": "Traiteur & plats préparés",
    "level": 1,
    "sort_order": 12,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0042",
        "parent_id": "CT012",
        "slug": "plats-chauds",
        "name": "Plats chauds",
        "level": 2,
        "sort_order": 42,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00144",
            "parent_id": "CAT0042",
            "slug": "plats-viande",
            "name": "Plats à base de viande",
            "level": 3,
            "sort_order": 144,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000925",
                "name_fr": "poulet rôti entier",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000926",
                "name_fr": "poulet rôti demi",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000927",
                "name_fr": "bœuf bourguignon",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000928",
                "name_fr": "ragoût de pattes",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000929",
                "name_fr": "tourtière",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000930",
                "name_fr": "pâté au poulet",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000931",
                "name_fr": "lasagne bolognaise",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM000932",
                "name_fr": "osso buco",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00145",
            "parent_id": "CAT0042",
            "slug": "plats-vegetariens",
            "name": "Plats végétariens",
            "level": 3,
            "sort_order": 145,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000933",
                "name_fr": "lasagne légumes",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000934",
                "name_fr": "curry végétarien",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000935",
                "name_fr": "risotto champignons",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000936",
                "name_fr": "quiche lorraine",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000937",
                "name_fr": "moussaka végétarienne",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000938",
                "name_fr": "falafels",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000939",
                "name_fr": "shakshuka",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00146",
            "parent_id": "CAT0042",
            "slug": "soupes-potages",
            "name": "Soupes & potages",
            "level": 3,
            "sort_order": 146,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000940",
                "name_fr": "soupe poulet nouilles",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000941",
                "name_fr": "potage butternut",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000942",
                "name_fr": "minestrone",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000943",
                "name_fr": "soupe de poisson",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000944",
                "name_fr": "velouté asperges",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000945",
                "name_fr": "gaspacho",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0043",
        "parent_id": "CT012",
        "slug": "plats-froids",
        "name": "Plats froids & salades",
        "level": 2,
        "sort_order": 43,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00147",
            "parent_id": "CAT0043",
            "slug": "salades-composees",
            "name": "Salades composées",
            "level": 3,
            "sort_order": 147,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000946",
                "name_fr": "salade niçoise",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000947",
                "name_fr": "salade César",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000948",
                "name_fr": "salade grecque",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000949",
                "name_fr": "taboulé",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000950",
                "name_fr": "salade de quinoa",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000951",
                "name_fr": "coleslaw",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000952",
                "name_fr": "salade de pâtes",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00148",
            "parent_id": "CAT0043",
            "slug": "plateaux",
            "name": "Plateaux & charcuteries",
            "level": 3,
            "sort_order": 148,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000953",
                "name_fr": "plateau fromages",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000954",
                "name_fr": "plateau charcuteries",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000955",
                "name_fr": "plateau antipasto",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000956",
                "name_fr": "plateau sushis",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000957",
                "name_fr": "plateau légumes crudités",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000958",
                "name_fr": "plateau fruits",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0044",
        "parent_id": "CT012",
        "slug": "commandes-speciales",
        "name": "Commandes spéciales",
        "level": 2,
        "sort_order": 44,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00149",
            "parent_id": "CAT0044",
            "slug": "buffets",
            "name": "Buffets & événements",
            "level": 3,
            "sort_order": 149,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000959",
                "name_fr": "buffet cocktail 10p",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000960",
                "name_fr": "buffet dîner 20p",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000961",
                "name_fr": "plateau sandwichs réunion",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000962",
                "name_fr": "brunch entreprise",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00150",
            "parent_id": "CAT0044",
            "slug": "boites-repas",
            "name": "Boîtes repas",
            "level": 3,
            "sort_order": 150,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000963",
                "name_fr": "lunch box healthy",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000964",
                "name_fr": "boîte repas semaine",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000965",
                "name_fr": "repas congélateur maison",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000966",
                "name_fr": "repas bébé frais",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT013",
    "slug": "boutique-cadeaux-deco",
    "name": "Boutique cadeaux & décoration",
    "level": 1,
    "sort_order": 13,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0045",
        "parent_id": "CT013",
        "slug": "cadeaux",
        "name": "Cadeaux",
        "level": 2,
        "sort_order": 45,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00151",
            "parent_id": "CAT0045",
            "slug": "cadeaux-hommes",
            "name": "Cadeaux hommes",
            "level": 3,
            "sort_order": 151,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000967",
                "name_fr": "portefeuille cuir",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000968",
                "name_fr": "montre casual",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000969",
                "name_fr": "sac à dos",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000970",
                "name_fr": "accessoires barbecue",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000971",
                "name_fr": "kit bière artisanale",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000972",
                "name_fr": "kit whisky",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00152",
            "parent_id": "CAT0045",
            "slug": "cadeaux-femmes",
            "name": "Cadeaux femmes",
            "level": 3,
            "sort_order": 152,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000973",
                "name_fr": "bougie luxe",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000974",
                "name_fr": "set spa maison",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000975",
                "name_fr": "bijoux fantaisie",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000976",
                "name_fr": "foulard",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000977",
                "name_fr": "agenda premium",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000978",
                "name_fr": "kit bien-être",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00153",
            "parent_id": "CAT0045",
            "slug": "cadeaux-enfants",
            "name": "Cadeaux enfants",
            "level": 3,
            "sort_order": 153,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000979",
                "name_fr": "jeu de société enfant",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000980",
                "name_fr": "livre illustré",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000981",
                "name_fr": "peluche",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000982",
                "name_fr": "kit créatif",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000983",
                "name_fr": "puzzle",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000984",
                "name_fr": "figurines",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM000985",
                "name_fr": "jeu éducatif",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00154",
            "parent_id": "CAT0045",
            "slug": "cadeaux-maison",
            "name": "Cadeaux maison",
            "level": 3,
            "sort_order": 154,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000986",
                "name_fr": "planche à découper artisanale",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000987",
                "name_fr": "set couteaux",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000988",
                "name_fr": "carafe à eau",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000989",
                "name_fr": "cafetière french press",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000990",
                "name_fr": "terrarium",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000991",
                "name_fr": "coffret épices",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0046",
        "parent_id": "CT013",
        "slug": "decoration",
        "name": "Décoration intérieure",
        "level": 2,
        "sort_order": 46,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00155",
            "parent_id": "CAT0046",
            "slug": "bougies-deco",
            "name": "Bougies & diffuseurs",
            "level": 3,
            "sort_order": 155,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000992",
                "name_fr": "bougie soja parfumée",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000993",
                "name_fr": "bougie cire d'abeille",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM000994",
                "name_fr": "diffuseur huiles essentielles",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM000995",
                "name_fr": "bâtons d'encens",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM000996",
                "name_fr": "bougie chauffe-plat",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM000997",
                "name_fr": "lanterne",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00156",
            "parent_id": "CAT0046",
            "slug": "cadres-photos",
            "name": "Cadres & tableaux",
            "level": 3,
            "sort_order": 156,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM000998",
                "name_fr": "cadre bois naturel",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM000999",
                "name_fr": "cadre métal",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001000",
                "name_fr": "porte-photo magnétique",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001001",
                "name_fr": "tableau abstrait",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001002",
                "name_fr": "impression photo",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001003",
                "name_fr": "affiche décorative",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00157",
            "parent_id": "CAT0046",
            "slug": "coussins-textiles",
            "name": "Coussins & textiles",
            "level": 3,
            "sort_order": 157,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001004",
                "name_fr": "coussin décoratif",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001005",
                "name_fr": "plaid laine",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001006",
                "name_fr": "jeté de canapé",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001007",
                "name_fr": "tapis berbère",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001008",
                "name_fr": "rideau voilage",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001009",
                "name_fr": "nappe lin",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00158",
            "parent_id": "CAT0046",
            "slug": "deco-murale",
            "name": "Déco murale",
            "level": 3,
            "sort_order": 158,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001010",
                "name_fr": "miroir rond",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001011",
                "name_fr": "étagère murale",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001012",
                "name_fr": "horloge murale",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001013",
                "name_fr": "tableau végétal",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001014",
                "name_fr": "lettres décoratives",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001015",
                "name_fr": "guirlande lumineuse",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0047",
        "parent_id": "CT013",
        "slug": "papeterie-bureau",
        "name": "Papeterie & bureau",
        "level": 2,
        "sort_order": 47,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00159",
            "parent_id": "CAT0047",
            "slug": "carnets",
            "name": "Carnets & agendas",
            "level": 3,
            "sort_order": 159,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001016",
                "name_fr": "carnet Moleskine",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001017",
                "name_fr": "agenda 2026",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001018",
                "name_fr": "journal bullet",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001019",
                "name_fr": "carnet aquarelle",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001020",
                "name_fr": "cahier pointillé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001021",
                "name_fr": "bloc-notes",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00160",
            "parent_id": "CAT0047",
            "slug": "stylos-crayons",
            "name": "Stylos & crayons",
            "level": 3,
            "sort_order": 160,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001022",
                "name_fr": "stylo bille premium",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001023",
                "name_fr": "stylo plume",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001024",
                "name_fr": "crayon graphite",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001025",
                "name_fr": "crayons de couleur",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001026",
                "name_fr": "feutres fins",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001027",
                "name_fr": "stabilos",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00161",
            "parent_id": "CAT0047",
            "slug": "cartes-voeux",
            "name": "Cartes & emballages",
            "level": 3,
            "sort_order": 161,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001028",
                "name_fr": "cartes anniversaire",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001029",
                "name_fr": "cartes de Noël",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001030",
                "name_fr": "cartes mariage",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001031",
                "name_fr": "papier cadeau",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001032",
                "name_fr": "ruban satin",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001033",
                "name_fr": "boîtes cadeaux",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001034",
                "name_fr": "sachets kraft",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT014",
    "slug": "boutique-mode",
    "name": "Boutique de vêtements",
    "level": 1,
    "sort_order": 14,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0048",
        "parent_id": "CT014",
        "slug": "femme",
        "name": "Femme",
        "level": 2,
        "sort_order": 48,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00162",
            "parent_id": "CAT0048",
            "slug": "hauts-femme",
            "name": "Hauts & chemisiers",
            "level": 3,
            "sort_order": 162,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001035",
                "name_fr": "t-shirt basique",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001036",
                "name_fr": "blouse fluide",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001037",
                "name_fr": "chemisier soie",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001038",
                "name_fr": "crop top",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001039",
                "name_fr": "débardeur",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001040",
                "name_fr": "pull léger",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001041",
                "name_fr": "cardigan",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00163",
            "parent_id": "CAT0048",
            "slug": "bas-femme",
            "name": "Jupes, pantalons & jeans",
            "level": 3,
            "sort_order": 163,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001042",
                "name_fr": "jeans slim",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001043",
                "name_fr": "jeans flare",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001044",
                "name_fr": "pantalon tailleur",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001045",
                "name_fr": "legging",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001046",
                "name_fr": "jupe midi",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001047",
                "name_fr": "jupe plissée",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001048",
                "name_fr": "short",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00164",
            "parent_id": "CAT0048",
            "slug": "robes",
            "name": "Robes",
            "level": 3,
            "sort_order": 164,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001049",
                "name_fr": "robe casual",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001050",
                "name_fr": "robe de soirée",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001051",
                "name_fr": "robe bohème",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001052",
                "name_fr": "robe midi",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001053",
                "name_fr": "robe maxi",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001054",
                "name_fr": "robe portefeuille",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001055",
                "name_fr": "combinaison",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00165",
            "parent_id": "CAT0048",
            "slug": "manteaux-femme",
            "name": "Manteaux & vestes",
            "level": 3,
            "sort_order": 165,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001056",
                "name_fr": "manteau laine",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001057",
                "name_fr": "trench-coat",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001058",
                "name_fr": "veste en jean",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001059",
                "name_fr": "blazer",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001060",
                "name_fr": "doudoune",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001061",
                "name_fr": "parka hiver",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001062",
                "name_fr": "imperméable",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0049",
        "parent_id": "CT014",
        "slug": "homme",
        "name": "Homme",
        "level": 2,
        "sort_order": 49,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00166",
            "parent_id": "CAT0049",
            "slug": "hauts-homme",
            "name": "T-shirts & chemises",
            "level": 3,
            "sort_order": 166,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001063",
                "name_fr": "t-shirt uni",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001064",
                "name_fr": "t-shirt graphique",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001065",
                "name_fr": "chemise oxford",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001066",
                "name_fr": "chemise flanelle",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001067",
                "name_fr": "polo",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001068",
                "name_fr": "henley",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00167",
            "parent_id": "CAT0049",
            "slug": "bas-homme",
            "name": "Pantalons & jeans",
            "level": 3,
            "sort_order": 167,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001069",
                "name_fr": "jeans slim",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001070",
                "name_fr": "jeans droit",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001071",
                "name_fr": "chino",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001072",
                "name_fr": "pantalon cargo",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001073",
                "name_fr": "jogging",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001074",
                "name_fr": "short sport",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001075",
                "name_fr": "bermuda",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00168",
            "parent_id": "CAT0049",
            "slug": "manteaux-homme",
            "name": "Manteaux & vestes",
            "level": 3,
            "sort_order": 168,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001076",
                "name_fr": "veste de travail",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001077",
                "name_fr": "doudoune",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001078",
                "name_fr": "parka",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001079",
                "name_fr": "manteau laine",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001080",
                "name_fr": "veste bomber",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001081",
                "name_fr": "coupe-vent",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0050",
        "parent_id": "CT014",
        "slug": "enfant-mode",
        "name": "Enfant",
        "level": 2,
        "sort_order": 50,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00169",
            "parent_id": "CAT0050",
            "slug": "bebe-mode",
            "name": "Bébé 0-24 mois",
            "level": 3,
            "sort_order": 169,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001082",
                "name_fr": "body bébé",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001083",
                "name_fr": "pyjama bébé",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001084",
                "name_fr": "set naissance",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001085",
                "name_fr": "robe bébé",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001086",
                "name_fr": "pantalon bébé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001087",
                "name_fr": "habit de neige bébé",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00170",
            "parent_id": "CAT0050",
            "slug": "enfant-2-12",
            "name": "Enfant 2-12 ans",
            "level": 3,
            "sort_order": 170,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001088",
                "name_fr": "t-shirt enfant",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001089",
                "name_fr": "jeans enfant",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001090",
                "name_fr": "robe fillette",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001091",
                "name_fr": "pyjama enfant",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001092",
                "name_fr": "manteau enfant",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001093",
                "name_fr": "uniforme scolaire",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00171",
            "parent_id": "CAT0050",
            "slug": "ado",
            "name": "Adolescent",
            "level": 3,
            "sort_order": 171,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001094",
                "name_fr": "hoodie ado",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001095",
                "name_fr": "jeans ado",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001096",
                "name_fr": "jogging ado",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001097",
                "name_fr": "t-shirt ado graphique",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001098",
                "name_fr": "veste ado",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001099",
                "name_fr": "robe ado",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0051",
        "parent_id": "CT014",
        "slug": "accessoires-mode",
        "name": "Accessoires",
        "level": 2,
        "sort_order": 51,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00172",
            "parent_id": "CAT0051",
            "slug": "sacs",
            "name": "Sacs",
            "level": 3,
            "sort_order": 172,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001100",
                "name_fr": "sac à main",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001101",
                "name_fr": "sac à dos",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001102",
                "name_fr": "tote bag",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001103",
                "name_fr": "pochette",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001104",
                "name_fr": "sac bandoulière",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001105",
                "name_fr": "valise cabine",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00173",
            "parent_id": "CAT0051",
            "slug": "bijoux-fantaisie",
            "name": "Bijoux fantaisie",
            "level": 3,
            "sort_order": 173,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001106",
                "name_fr": "collier",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001107",
                "name_fr": "bracelet",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001108",
                "name_fr": "boucles d'oreilles",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001109",
                "name_fr": "bague",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001110",
                "name_fr": "montre",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001111",
                "name_fr": "ensemble bijoux",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00174",
            "parent_id": "CAT0051",
            "slug": "chapeaux-foulards",
            "name": "Chapeaux & foulards",
            "level": 3,
            "sort_order": 174,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001112",
                "name_fr": "tuque laine",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001113",
                "name_fr": "casquette baseball",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001114",
                "name_fr": "béret",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001115",
                "name_fr": "foulard soie",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001116",
                "name_fr": "écharpe hiver",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001117",
                "name_fr": "bandana",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT015",
    "slug": "animalerie",
    "name": "Animalerie",
    "level": 1,
    "sort_order": 15,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0052",
        "parent_id": "CT015",
        "slug": "chiens",
        "name": "Chiens",
        "level": 2,
        "sort_order": 52,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00175",
            "parent_id": "CAT0052",
            "slug": "nourriture-chien",
            "name": "Nourriture chien",
            "level": 3,
            "sort_order": 175,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001118",
                "name_fr": "croquettes chiot",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001119",
                "name_fr": "croquettes adulte",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001120",
                "name_fr": "croquettes senior",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001121",
                "name_fr": "nourriture humide",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001122",
                "name_fr": "nourriture sans grain",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001123",
                "name_fr": "friandises chien",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001124",
                "name_fr": "os naturels",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00176",
            "parent_id": "CAT0052",
            "slug": "accessoires-chien",
            "name": "Accessoires chien",
            "level": 3,
            "sort_order": 176,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001125",
                "name_fr": "laisse rétractable",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001126",
                "name_fr": "harnais",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001127",
                "name_fr": "collier",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001128",
                "name_fr": "cage transport",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001129",
                "name_fr": "coussin chien",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001130",
                "name_fr": "jouets chien",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001131",
                "name_fr": "brosse poil",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM001132",
                "name_fr": "shampoing chien",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0053",
        "parent_id": "CT015",
        "slug": "chats",
        "name": "Chats",
        "level": 2,
        "sort_order": 53,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00177",
            "parent_id": "CAT0053",
            "slug": "nourriture-chat",
            "name": "Nourriture chat",
            "level": 3,
            "sort_order": 177,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001133",
                "name_fr": "croquettes chaton",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001134",
                "name_fr": "croquettes adulte stérilisé",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001135",
                "name_fr": "nourriture humide poulets",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001136",
                "name_fr": "nourriture poisson",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001137",
                "name_fr": "friandises chat",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001138",
                "name_fr": "herbe à chat",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001139",
                "name_fr": "pâtée premium",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00178",
            "parent_id": "CAT0053",
            "slug": "accessoires-chat",
            "name": "Accessoires chat",
            "level": 3,
            "sort_order": 178,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001140",
                "name_fr": "griffoir",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001141",
                "name_fr": "arbre à chat",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001142",
                "name_fr": "litière bois",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001143",
                "name_fr": "litière agglomérante",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001144",
                "name_fr": "bac à litière",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001145",
                "name_fr": "jouets chat",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001146",
                "name_fr": "fontaine eau chat",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM001147",
                "name_fr": "transportin",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0054",
        "parent_id": "CT015",
        "slug": "petits-animaux",
        "name": "Petits animaux & oiseaux",
        "level": 2,
        "sort_order": 54,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00179",
            "parent_id": "CAT0054",
            "slug": "rongeurs",
            "name": "Rongeurs",
            "level": 3,
            "sort_order": 179,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001148",
                "name_fr": "nourriture hamster",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001149",
                "name_fr": "nourriture lapin",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001150",
                "name_fr": "nourriture cochon d'Inde",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001151",
                "name_fr": "foin timothy",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001152",
                "name_fr": "litière rongeur",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001153",
                "name_fr": "cage hamster",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001154",
                "name_fr": "roue exercise",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00180",
            "parent_id": "CAT0054",
            "slug": "oiseaux-poissons",
            "name": "Oiseaux & poissons",
            "level": 3,
            "sort_order": 180,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001155",
                "name_fr": "graines perruche",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001156",
                "name_fr": "graines canari",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001157",
                "name_fr": "cage oiseau",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001158",
                "name_fr": "nourriture poisson",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001159",
                "name_fr": "aquarium starter",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001160",
                "name_fr": "décorations aquarium",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001161",
                "name_fr": "filtre aquarium",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT016",
    "slug": "librairie",
    "name": "Librairie indépendante",
    "level": 1,
    "sort_order": 16,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0055",
        "parent_id": "CT016",
        "slug": "livres",
        "name": "Livres",
        "level": 2,
        "sort_order": 55,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00181",
            "parent_id": "CAT0055",
            "slug": "romans",
            "name": "Romans & littérature",
            "level": 3,
            "sort_order": 181,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001162",
                "name_fr": "roman québécois",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001163",
                "name_fr": "roman policier",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001164",
                "name_fr": "roman fantastique",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001165",
                "name_fr": "roman historique",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001166",
                "name_fr": "science-fiction",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001167",
                "name_fr": "romantique",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001168",
                "name_fr": "thriller",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00182",
            "parent_id": "CAT0055",
            "slug": "essais",
            "name": "Essais & documentaires",
            "level": 3,
            "sort_order": 182,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001169",
                "name_fr": "politique québécoise",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001170",
                "name_fr": "histoire Canada",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001171",
                "name_fr": "biographie",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001172",
                "name_fr": "développement personnel",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001173",
                "name_fr": "philosophie",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001174",
                "name_fr": "économie",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001175",
                "name_fr": "sciences",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00183",
            "parent_id": "CAT0055",
            "slug": "enfants-livres",
            "name": "Jeunesse & enfants",
            "level": 3,
            "sort_order": 183,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001176",
                "name_fr": "album illustré bébé",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001177",
                "name_fr": "album enfant 3-6 ans",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001178",
                "name_fr": "roman jeunesse",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001179",
                "name_fr": "manga",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001180",
                "name_fr": "BD enfant",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001181",
                "name_fr": "documentaire jeunesse",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00184",
            "parent_id": "CAT0055",
            "slug": "bd-manga",
            "name": "BD & manga",
            "level": 3,
            "sort_order": 184,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001182",
                "name_fr": "BD franco-belge",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001183",
                "name_fr": "comics Marvel/DC",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001184",
                "name_fr": "manga shonen",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001185",
                "name_fr": "manga seinen",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001186",
                "name_fr": "manga shojo",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001187",
                "name_fr": "manhwa",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00185",
            "parent_id": "CAT0055",
            "slug": "pratique",
            "name": "Livres pratiques",
            "level": 3,
            "sort_order": 185,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001188",
                "name_fr": "livre cuisine",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001189",
                "name_fr": "livre jardinage",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001190",
                "name_fr": "guide voyage",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001191",
                "name_fr": "livre yoga",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001192",
                "name_fr": "livre bricolage",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001193",
                "name_fr": "livre yoga",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0056",
        "parent_id": "CT016",
        "slug": "papeterie-librairie",
        "name": "Papeterie créative",
        "level": 2,
        "sort_order": 56,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00186",
            "parent_id": "CAT0056",
            "slug": "materiel-art",
            "name": "Matériel artistique",
            "level": 3,
            "sort_order": 186,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001194",
                "name_fr": "crayons aquarelle",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001195",
                "name_fr": "acryliques",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001196",
                "name_fr": "toiles",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001197",
                "name_fr": "pinceaux",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001198",
                "name_fr": "pastels",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001199",
                "name_fr": "feutres Copic",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001200",
                "name_fr": "papier aquarelle",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM001201",
                "name_fr": "carnet à dessin",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00187",
            "parent_id": "CAT0056",
            "slug": "fournitures-bureau",
            "name": "Fournitures bureau & école",
            "level": 3,
            "sort_order": 187,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001202",
                "name_fr": "stylos bille",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001203",
                "name_fr": "surligneur",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001204",
                "name_fr": "ruban adhésif",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001205",
                "name_fr": "ciseau papier",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001206",
                "name_fr": "agrafeuse",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001207",
                "name_fr": "perforeuse",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001208",
                "name_fr": "classeur",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM001209",
                "name_fr": "intercalaires",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT017",
    "slug": "informatique-telephonie",
    "name": "Informatique & téléphonie",
    "level": 1,
    "sort_order": 17,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0057",
        "parent_id": "CT017",
        "slug": "accessoires-telephone",
        "name": "Accessoires téléphone",
        "level": 2,
        "sort_order": 57,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00188",
            "parent_id": "CAT0057",
            "slug": "coques",
            "name": "Coques & protections",
            "level": 3,
            "sort_order": 188,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001210",
                "name_fr": "coque iPhone silicone",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001211",
                "name_fr": "coque Samsung",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001212",
                "name_fr": "coque rigide",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001213",
                "name_fr": "coque portefeuille",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001214",
                "name_fr": "verre trempé",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001215",
                "name_fr": "film protection écran",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00189",
            "parent_id": "CAT0057",
            "slug": "cables-chargeurs",
            "name": "Câbles & chargeurs",
            "level": 3,
            "sort_order": 189,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001216",
                "name_fr": "câble USB-C",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001217",
                "name_fr": "câble Lightning",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001218",
                "name_fr": "chargeur rapide 20W",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001219",
                "name_fr": "chargeur sans fil",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001220",
                "name_fr": "batterie externe",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001221",
                "name_fr": "hub USB-C",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00190",
            "parent_id": "CAT0057",
            "slug": "audio-mobile",
            "name": "Écouteurs & audio",
            "level": 3,
            "sort_order": 190,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001222",
                "name_fr": "écouteurs filaires",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001223",
                "name_fr": "écouteurs Bluetooth",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001224",
                "name_fr": "casque gaming",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001225",
                "name_fr": "enceinte Bluetooth portable",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001226",
                "name_fr": "enceinte étanche",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0058",
        "parent_id": "CT017",
        "slug": "accessoires-pc",
        "name": "Accessoires ordinateur",
        "level": 2,
        "sort_order": 58,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00191",
            "parent_id": "CAT0058",
            "slug": "peripheriques",
            "name": "Périphériques",
            "level": 3,
            "sort_order": 191,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001227",
                "name_fr": "souris sans fil",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001228",
                "name_fr": "clavier sans fil",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001229",
                "name_fr": "webcam HD",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001230",
                "name_fr": "microphone USB",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001231",
                "name_fr": "hub USB",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001232",
                "name_fr": "tapis souris gaming",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00192",
            "parent_id": "CAT0058",
            "slug": "stockage",
            "name": "Stockage",
            "level": 3,
            "sort_order": 192,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001233",
                "name_fr": "clé USB 64GB",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001234",
                "name_fr": "clé USB 128GB",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001235",
                "name_fr": "disque dur externe",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001236",
                "name_fr": "carte SD 128GB",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001237",
                "name_fr": "SSD externe",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001238",
                "name_fr": "lecteur carte mémoire",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0059",
        "parent_id": "CT017",
        "slug": "gadgets-tech",
        "name": "Gadgets & électronique",
        "level": 2,
        "sort_order": 59,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00193",
            "parent_id": "CAT0059",
            "slug": "maison-connectee",
            "name": "Maison connectée",
            "level": 3,
            "sort_order": 193,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001239",
                "name_fr": "ampoule connectée",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001240",
                "name_fr": "prise connectée",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001241",
                "name_fr": "assistant vocal",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001242",
                "name_fr": "caméra surveillance",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001243",
                "name_fr": "thermostat intelligent",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001244",
                "name_fr": "sonnette vidéo",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00194",
            "parent_id": "CAT0059",
            "slug": "objets-connectes",
            "name": "Objets connectés",
            "level": 3,
            "sort_order": 194,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001245",
                "name_fr": "montre connectée",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001246",
                "name_fr": "bracelet fitness",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001247",
                "name_fr": "écouteurs true wireless",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001248",
                "name_fr": "tablette enfant",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001249",
                "name_fr": "liseuse e-ink",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001250",
                "name_fr": "traqueur GPS",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT018",
    "slug": "quincaillerie",
    "name": "Quincaillerie de quartier",
    "level": 1,
    "sort_order": 18,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0060",
        "parent_id": "CT018",
        "slug": "outils-main",
        "name": "Outils à main",
        "level": 2,
        "sort_order": 60,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00195",
            "parent_id": "CAT0060",
            "slug": "mesure",
            "name": "Mesure & traçage",
            "level": 3,
            "sort_order": 195,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001251",
                "name_fr": "ruban à mesurer",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001252",
                "name_fr": "niveau bulle",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001253",
                "name_fr": "équerre",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001254",
                "name_fr": "crayon menuisier",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001255",
                "name_fr": "fil à plomb",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001256",
                "name_fr": "laser niveau",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00196",
            "parent_id": "CAT0060",
            "slug": "vissage",
            "name": "Vissage & fixation",
            "level": 3,
            "sort_order": 196,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001257",
                "name_fr": "tournevis plat",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001258",
                "name_fr": "tournevis cruciforme",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001259",
                "name_fr": "jeu tournevis",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001260",
                "name_fr": "marteau",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001261",
                "name_fr": "pince multiprises",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001262",
                "name_fr": "clé allen",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001263",
                "name_fr": "mandrin clé",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00197",
            "parent_id": "CAT0060",
            "slug": "coupe",
            "name": "Coupe & découpe",
            "level": 3,
            "sort_order": 197,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001264",
                "name_fr": "couteau universel",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001265",
                "name_fr": "cutter lames",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001266",
                "name_fr": "scie à main",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001267",
                "name_fr": "cisaille",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001268",
                "name_fr": "pince coupante",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001269",
                "name_fr": "scie cloche",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0061",
        "parent_id": "CT018",
        "slug": "visserie-quincaille",
        "name": "Visserie & fixation",
        "level": 2,
        "sort_order": 61,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00198",
            "parent_id": "CAT0061",
            "slug": "vis",
            "name": "Vis & clous",
            "level": 3,
            "sort_order": 198,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001270",
                "name_fr": "vis bois 3x40mm",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001271",
                "name_fr": "vis bois 4x60mm",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001272",
                "name_fr": "vis métal",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001273",
                "name_fr": "clous finition",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001274",
                "name_fr": "clous charpente",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001275",
                "name_fr": "tire-fond",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00199",
            "parent_id": "CAT0061",
            "slug": "chevilles",
            "name": "Chevilles & ancrages",
            "level": 3,
            "sort_order": 199,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001276",
                "name_fr": "cheville nylon 6mm",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001277",
                "name_fr": "cheville nylon 8mm",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001278",
                "name_fr": "cheville métal expansion",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001279",
                "name_fr": "ancrage béton",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001280",
                "name_fr": "plaque murale",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0062",
        "parent_id": "CT018",
        "slug": "peinture-quincaille",
        "name": "Peinture & finition",
        "level": 2,
        "sort_order": 62,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00200",
            "parent_id": "CAT0062",
            "slug": "peintures",
            "name": "Peintures",
            "level": 3,
            "sort_order": 200,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001281",
                "name_fr": "peinture mur blanc",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001282",
                "name_fr": "peinture plafond",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001283",
                "name_fr": "peinture couleur échantillon",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001284",
                "name_fr": "peinture extérieure",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001285",
                "name_fr": "laque bois",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00201",
            "parent_id": "CAT0062",
            "slug": "accessoires-peinture",
            "name": "Accessoires peinture",
            "level": 3,
            "sort_order": 201,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001286",
                "name_fr": "rouleau peinture",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001287",
                "name_fr": "brosse peinture",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001288",
                "name_fr": "bac peinture",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001289",
                "name_fr": "ruban cache",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001290",
                "name_fr": "papier peindre",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001291",
                "name_fr": "bâche plastique",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0063",
        "parent_id": "CT018",
        "slug": "eclairage-elec",
        "name": "Éclairage & électricité",
        "level": 2,
        "sort_order": 63,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00202",
            "parent_id": "CAT0063",
            "slug": "ampoules",
            "name": "Ampoules",
            "level": 3,
            "sort_order": 202,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001292",
                "name_fr": "ampoule LED E27",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001293",
                "name_fr": "ampoule LED E14",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001294",
                "name_fr": "ampoule LED GU10",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001295",
                "name_fr": "ampoule halogène",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001296",
                "name_fr": "tube fluorescent",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001297",
                "name_fr": "ruban LED",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00203",
            "parent_id": "CAT0063",
            "slug": "elec-basique",
            "name": "Électricité basique",
            "level": 3,
            "sort_order": 203,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001298",
                "name_fr": "prises multiples",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001299",
                "name_fr": "rallonge électrique",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001300",
                "name_fr": "disjoncteur",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001301",
                "name_fr": "interrupteur",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001302",
                "name_fr": "fil électrique",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001303",
                "name_fr": "dominos connexion",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT019",
    "slug": "sport-velo",
    "name": "Sport & vélo",
    "level": 1,
    "sort_order": 19,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0064",
        "parent_id": "CT019",
        "slug": "velo-sport",
        "name": "Vélo",
        "level": 2,
        "sort_order": 64,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00204",
            "parent_id": "CAT0064",
            "slug": "velos",
            "name": "Vélos",
            "level": 3,
            "sort_order": 204,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001304",
                "name_fr": "vélo de ville",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001305",
                "name_fr": "vélo de route",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001306",
                "name_fr": "vélo de montagne",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001307",
                "name_fr": "vélo électrique",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001308",
                "name_fr": "vélo enfant",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001309",
                "name_fr": "vélo pliant",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001310",
                "name_fr": "trottinette",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00205",
            "parent_id": "CAT0064",
            "slug": "pieces-velo",
            "name": "Pièces & entretien",
            "level": 3,
            "sort_order": 205,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001311",
                "name_fr": "chambre à air 700c",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001312",
                "name_fr": "chambre à air 26 pouces",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001313",
                "name_fr": "pneu vélo",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001314",
                "name_fr": "chaîne vélo",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001315",
                "name_fr": "câble frein",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001316",
                "name_fr": "lubrifiant chaîne",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001317",
                "name_fr": "kit crevaison",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00206",
            "parent_id": "CAT0064",
            "slug": "accessoires-velo",
            "name": "Accessoires",
            "level": 3,
            "sort_order": 206,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001318",
                "name_fr": "casque vélo",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001319",
                "name_fr": "cadenas U",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001320",
                "name_fr": "lumière avant LED",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001321",
                "name_fr": "lumière arrière",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001322",
                "name_fr": "sacoches vélo",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001323",
                "name_fr": "porte-bidon",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001324",
                "name_fr": "guidoline",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM001325",
                "name_fr": "selle",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0065",
        "parent_id": "CT019",
        "slug": "fitness",
        "name": "Fitness & musculation",
        "level": 2,
        "sort_order": 65,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00207",
            "parent_id": "CAT0065",
            "slug": "equipement-fitness",
            "name": "Équipement",
            "level": 3,
            "sort_order": 207,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001326",
                "name_fr": "haltères réglables",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001327",
                "name_fr": "kettlebell",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001328",
                "name_fr": "corde à sauter",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001329",
                "name_fr": "bandes élastiques",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001330",
                "name_fr": "tapis yoga",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001331",
                "name_fr": "foam roller",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001332",
                "name_fr": "balle pilates",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM001333",
                "name_fr": "ceinture abdominale",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00208",
            "parent_id": "CAT0065",
            "slug": "nutrition-sport",
            "name": "Nutrition sportive",
            "level": 3,
            "sort_order": 208,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001334",
                "name_fr": "protéines whey",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001335",
                "name_fr": "protéines végétales",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001336",
                "name_fr": "créatine",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001337",
                "name_fr": "BCAA",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001338",
                "name_fr": "pré-entraînement",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001339",
                "name_fr": "électrolytes sport",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001340",
                "name_fr": "barres protéinées",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0066",
        "parent_id": "CT019",
        "slug": "sports-plein-air",
        "name": "Sports & plein air",
        "level": 2,
        "sort_order": 66,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00209",
            "parent_id": "CAT0066",
            "slug": "randonnee",
            "name": "Randonnée & camping",
            "level": 3,
            "sort_order": 209,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001341",
                "name_fr": "sac à dos randonnée",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001342",
                "name_fr": "gourde inox",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001343",
                "name_fr": "bâtons trekking",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001344",
                "name_fr": "lampe frontale",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001345",
                "name_fr": "couverture survie",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001346",
                "name_fr": "trousse premiers secours",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001347",
                "name_fr": "boussole",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00210",
            "parent_id": "CAT0066",
            "slug": "sports-raquettes",
            "name": "Sports de raquette",
            "level": 3,
            "sort_order": 210,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001348",
                "name_fr": "raquette tennis",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001349",
                "name_fr": "raquette badminton",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001350",
                "name_fr": "volant badminton",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001351",
                "name_fr": "raquette pickleball",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001352",
                "name_fr": "balles tennis",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00211",
            "parent_id": "CAT0066",
            "slug": "sports-equipe",
            "name": "Sports d'équipe",
            "level": 3,
            "sort_order": 211,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001353",
                "name_fr": "ballon soccer",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001354",
                "name_fr": "ballon basketball",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001355",
                "name_fr": "ballon volleyball",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001356",
                "name_fr": "filet badminton",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001357",
                "name_fr": "pompe à ballon",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001358",
                "name_fr": "cônes sport",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "CT020",
    "slug": "categories-transversales",
    "name": "Catégories transversales",
    "level": 1,
    "sort_order": 20,
    "is_active": true,
    "categories": [
      {
        "id": "CAT0067",
        "parent_id": "CT020",
        "slug": "promotions",
        "name": "Promotions & offres",
        "level": 2,
        "sort_order": 67,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00212",
            "parent_id": "CAT0067",
            "slug": "speciaux",
            "name": "Spéciaux",
            "level": 3,
            "sort_order": 212,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001359",
                "name_fr": "2 pour 1",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001360",
                "name_fr": "rabais 20%",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001361",
                "name_fr": "liquidation",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001362",
                "name_fr": "bundle économique",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001363",
                "name_fr": "offre du jour",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00213",
            "parent_id": "CAT0067",
            "slug": "nouveautes-trans",
            "name": "Nouveautés",
            "level": 3,
            "sort_order": 213,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001364",
                "name_fr": "nouvel arrivage",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001365",
                "name_fr": "édition limitée",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001366",
                "name_fr": "retour en stock",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001367",
                "name_fr": "pré-commande",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00214",
            "parent_id": "CAT0067",
            "slug": "saisonniers",
            "name": "Saisonniers",
            "level": 3,
            "sort_order": 214,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001368",
                "name_fr": "Noël",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001369",
                "name_fr": "Pâques",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001370",
                "name_fr": "Saint-Valentin",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001371",
                "name_fr": "Halloween",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001372",
                "name_fr": "Ramadan & Aïd",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001373",
                "name_fr": "rentrée scolaire",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001374",
                "name_fr": "fête des Mères",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM001375",
                "name_fr": "fête des Pères",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0068",
        "parent_id": "CT020",
        "slug": "origine-prod",
        "name": "Origine & certifications",
        "level": 2,
        "sort_order": 68,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00215",
            "parent_id": "CAT0068",
            "slug": "local",
            "name": "Local & artisanal",
            "level": 3,
            "sort_order": 215,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001376",
                "name_fr": "certifié québécois",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001377",
                "name_fr": "made in Canada",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001378",
                "name_fr": "artisan local",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001379",
                "name_fr": "ferme locale",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001380",
                "name_fr": "micro-production",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001381",
                "name_fr": "fait main",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00216",
            "parent_id": "CAT0068",
            "slug": "certifications",
            "name": "Certifications",
            "level": 3,
            "sort_order": 216,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001382",
                "name_fr": "certifié bio",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001383",
                "name_fr": "certifié équitable",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001384",
                "name_fr": "sans OGM",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001385",
                "name_fr": "halal certifié",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001386",
                "name_fr": "casher",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001387",
                "name_fr": "sans gluten certifié",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001388",
                "name_fr": "vegan certifié",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00217",
            "parent_id": "CAT0068",
            "slug": "ecolo",
            "name": "Écoresponsable",
            "level": 3,
            "sort_order": 217,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001389",
                "name_fr": "zéro déchet",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001390",
                "name_fr": "emballage recyclable",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001391",
                "name_fr": "compostable",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001392",
                "name_fr": "carbone neutre",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001393",
                "name_fr": "produit recharge",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001394",
                "name_fr": "consigne",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              }
            ]
          }
        ]
      },
      {
        "id": "CAT0069",
        "parent_id": "CT020",
        "slug": "formats-unites",
        "name": "Formats & unités",
        "level": 2,
        "sort_order": 69,
        "is_active": true,
        "requires_age_check": false,
        "tax_code": "TPS-TVQ-STANDARD",
        "subcategories": [
          {
            "id": "SUB00218",
            "parent_id": "CAT0069",
            "slug": "formats-trans",
            "name": "Formats",
            "level": 3,
            "sort_order": 218,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001395",
                "name_fr": "format individuel",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001396",
                "name_fr": "format duo",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001397",
                "name_fr": "format familial",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001398",
                "name_fr": "format voyage",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001399",
                "name_fr": "vrac",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001400",
                "name_fr": "gros format",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001401",
                "name_fr": "mini format",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              }
            ]
          },
          {
            "id": "SUB00219",
            "parent_id": "CAT0069",
            "slug": "unites-mesure",
            "name": "Unités de mesure",
            "level": 3,
            "sort_order": 219,
            "is_active": true,
            "requires_age_check": false,
            "tax_code": "TPS-TVQ-STANDARD",
            "sample_items": [
              {
                "id": "ITEM001402",
                "name_fr": "ml",
                "level": 4,
                "sort_order": 1,
                "is_active": true
              },
              {
                "id": "ITEM001403",
                "name_fr": "L",
                "level": 4,
                "sort_order": 2,
                "is_active": true
              },
              {
                "id": "ITEM001404",
                "name_fr": "g",
                "level": 4,
                "sort_order": 3,
                "is_active": true
              },
              {
                "id": "ITEM001405",
                "name_fr": "kg",
                "level": 4,
                "sort_order": 4,
                "is_active": true
              },
              {
                "id": "ITEM001406",
                "name_fr": "lb",
                "level": 4,
                "sort_order": 5,
                "is_active": true
              },
              {
                "id": "ITEM001407",
                "name_fr": "oz",
                "level": 4,
                "sort_order": 6,
                "is_active": true
              },
              {
                "id": "ITEM001408",
                "name_fr": "unité",
                "level": 4,
                "sort_order": 7,
                "is_active": true
              },
              {
                "id": "ITEM001409",
                "name_fr": "paquet",
                "level": 4,
                "sort_order": 8,
                "is_active": true
              },
              {
                "id": "ITEM001410",
                "name_fr": "boîte",
                "level": 4,
                "sort_order": 9,
                "is_active": true
              },
              {
                "id": "ITEM001411",
                "name_fr": "douzaine",
                "level": 4,
                "sort_order": 10,
                "is_active": true
              },
              {
                "id": "ITEM001412",
                "name_fr": "sachet",
                "level": 4,
                "sort_order": 11,
                "is_active": true
              }
            ]
          }
        ]
      }
    ]
  }
];

export const TAXONOMY_STATS = {"commerce_types": 20, "categories": 69, "subcategories": 219, "sample_items": 1412};

export const ALL_CATEGORIES: Category[] = TAXONOMY.flatMap(ct => ct.categories);
export const ALL_SUBCATEGORIES: SubCategory[] = ALL_CATEGORIES.flatMap(c => c.subcategories);

export function getCategoriesByCommerceSlug(slug: string): Category[] {
  return TAXONOMY.find(ct => ct.slug === slug)?.categories || TAXONOMY[0].categories;
}
export function getSubcategoriesByCategoryId(catId: string): SubCategory[] {
  return ALL_CATEGORIES.find(c => c.id === catId)?.subcategories || [];
}
export function getSampleItems(subId: string): SampleItem[] {
  return ALL_SUBCATEGORIES.find(s => s.id === subId)?.sample_items || [];
}
export function searchCategories(q: string): Category[] {
  const lq = q.toLowerCase().trim();
  if (!lq) return [];
  return ALL_CATEGORIES.filter(c => c.name.toLowerCase().includes(lq) || c.slug.includes(lq));
}