// Zones DepXpreS — Grand Montréal v1
// 103 zones: 59 actives (core) + 44 expansion future
// NE PAS MODIFIER MANUELLEMENT

export interface DeliveryZone {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  region: string;
  region_code: string;
  is_core: boolean;
  is_active: boolean;
  delivery_zone_group: string;
  sort_order: number;
  search_terms: string[];
  aliases: string[];
  google_places_query: string;
  delivery_fee: number;
  min_order: number;
  estimated_time_min: number;
  estimated_time_max: number;
  parent_borough?: string;
  parent_city?: string;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    "id": "laval-auteuil",
    "name": "Auteuil",
    "slug": "auteuil",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 1,
    "search_terms": [
      "auteuil",
      "laval"
    ],
    "aliases": [
      "Laval Auteuil",
      "Auteuil"
    ],
    "google_places_query": "Auteuil, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-chomedey",
    "name": "Chomedey",
    "slug": "chomedey",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 2,
    "search_terms": [
      "chomedey",
      "laval"
    ],
    "aliases": [
      "Laval Chomedey",
      "Chomedey"
    ],
    "google_places_query": "Chomedey, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-duvernay",
    "name": "Duvernay",
    "slug": "duvernay",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 3,
    "search_terms": [
      "duvernay",
      "laval"
    ],
    "aliases": [
      "Laval Duvernay",
      "Duvernay"
    ],
    "google_places_query": "Duvernay, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-fabreville",
    "name": "Fabreville",
    "slug": "fabreville",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 4,
    "search_terms": [
      "laval",
      "fabreville"
    ],
    "aliases": [
      "Laval Fabreville",
      "Fabreville"
    ],
    "google_places_query": "Fabreville, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-iles-laval",
    "name": "Îles Laval",
    "slug": "iles-laval",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 5,
    "search_terms": [
      "iles laval",
      "laval",
      "îles laval"
    ],
    "aliases": [
      "Laval Îles Laval",
      "Îles Laval"
    ],
    "google_places_query": "Îles Laval, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-laval-des-rapides",
    "name": "Laval-des-Rapides",
    "slug": "laval-des-rapides",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 6,
    "search_terms": [
      "laval-des-rapides",
      "laval des rapides",
      "laval"
    ],
    "aliases": [
      "Laval Laval-des-Rapides",
      "Laval-des-Rapides"
    ],
    "google_places_query": "Laval-des-Rapides, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-laval-ouest",
    "name": "Laval-Ouest",
    "slug": "laval-ouest",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 7,
    "search_terms": [
      "laval-ouest",
      "laval",
      "laval ouest"
    ],
    "aliases": [
      "Laval Laval-Ouest",
      "Laval-Ouest"
    ],
    "google_places_query": "Laval-Ouest, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-pont-viau",
    "name": "Pont-Viau",
    "slug": "pont-viau",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 8,
    "search_terms": [
      "pont-viau",
      "pont viau",
      "laval"
    ],
    "aliases": [
      "Laval Pont-Viau",
      "Pont-Viau"
    ],
    "google_places_query": "Pont-Viau, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-sainte-dorothee",
    "name": "Sainte-Dorothée",
    "slug": "sainte-dorothee",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 9,
    "search_terms": [
      "sainte-dorothée",
      "sainte dorothee",
      "laval",
      "sainte-dorothee"
    ],
    "aliases": [
      "Laval Sainte-Dorothée",
      "Sainte-Dorothée"
    ],
    "google_places_query": "Sainte-Dorothée, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-sainte-rose",
    "name": "Sainte-Rose",
    "slug": "sainte-rose",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 10,
    "search_terms": [
      "sainte-rose",
      "sainte rose",
      "laval"
    ],
    "aliases": [
      "Laval Sainte-Rose",
      "Sainte-Rose"
    ],
    "google_places_query": "Sainte-Rose, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-saint-francois",
    "name": "Saint-François",
    "slug": "saint-francois",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 11,
    "search_terms": [
      "saint francois",
      "saint-françois",
      "laval",
      "saint-francois"
    ],
    "aliases": [
      "Laval Saint-François",
      "Saint-François"
    ],
    "google_places_query": "Saint-François, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-saint-vincent-de-paul",
    "name": "Saint-Vincent-de-Paul",
    "slug": "saint-vincent-de-paul",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 12,
    "search_terms": [
      "laval",
      "saint-vincent-de-paul",
      "saint vincent de paul"
    ],
    "aliases": [
      "Laval Saint-Vincent-de-Paul",
      "Saint-Vincent-de-Paul"
    ],
    "google_places_query": "Saint-Vincent-de-Paul, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "laval-vimont",
    "name": "Vimont",
    "slug": "vimont",
    "type": "district",
    "city": "Laval",
    "region": "laval",
    "region_code": "QC-LAV",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "laval",
    "sort_order": 13,
    "search_terms": [
      "laval",
      "vimont"
    ],
    "aliases": [
      "Laval Vimont",
      "Vimont"
    ],
    "google_places_query": "Vimont, Laval, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 20,
    "estimated_time_max": 35
  },
  {
    "id": "montreal-ahuntsic-cartierville",
    "name": "Ahuntsic-Cartierville",
    "slug": "ahuntsic-cartierville",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 14,
    "search_terms": [
      "ahuntsic-cartierville",
      "ahuntsic cartierville",
      "montréal"
    ],
    "aliases": [
      "Ahuntsic-Cartierville",
      "Montréal Ahuntsic-Cartierville"
    ],
    "google_places_query": "Ahuntsic-Cartierville, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-anjou",
    "name": "Anjou",
    "slug": "anjou",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 15,
    "search_terms": [
      "anjou",
      "montréal"
    ],
    "aliases": [
      "Anjou",
      "Montréal Anjou"
    ],
    "google_places_query": "Anjou, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-cote-des-neiges-notre-dame-de-grace",
    "name": "Côte-des-Neiges–Notre-Dame-de-Grâce",
    "slug": "cote-des-neiges-notre-dame-de-grace",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 16,
    "search_terms": [
      "cote-des-neigesnotre-dame-de-grace",
      "cote des neiges notre dame de grace",
      "montréal",
      "côte-des-neiges–notre-dame-de-grâce"
    ],
    "aliases": [
      "Côte-des-Neiges–Notre-Dame-de-Grâce",
      "Montréal Côte-des-Neiges–Notre-Dame-de-Grâce"
    ],
    "google_places_query": "Côte-des-Neiges–Notre-Dame-de-Grâce, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-ile-bizard-sainte-genevieve",
    "name": "L'Île-Bizard–Sainte-Geneviève",
    "slug": "ile-bizard-sainte-genevieve",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 17,
    "search_terms": [
      "l'ile-bizardsainte-genevieve",
      "ile bizard sainte genevieve",
      "l'île-bizard–sainte-geneviève",
      "montréal"
    ],
    "aliases": [
      "L'Île-Bizard–Sainte-Geneviève",
      "Montréal L'Île-Bizard–Sainte-Geneviève"
    ],
    "google_places_query": "L'Île-Bizard–Sainte-Geneviève, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-lachine",
    "name": "Lachine",
    "slug": "lachine",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 18,
    "search_terms": [
      "lachine",
      "montréal"
    ],
    "aliases": [
      "Lachine",
      "Montréal Lachine"
    ],
    "google_places_query": "Lachine, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-lasalle",
    "name": "LaSalle",
    "slug": "lasalle",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 19,
    "search_terms": [
      "lasalle",
      "montréal"
    ],
    "aliases": [
      "LaSalle",
      "Montréal LaSalle"
    ],
    "google_places_query": "LaSalle, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-plateau-mont-royal",
    "name": "Le Plateau-Mont-Royal",
    "slug": "plateau-mont-royal",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 20,
    "search_terms": [
      "plateau mont royal",
      "le plateau-mont-royal",
      "montréal"
    ],
    "aliases": [
      "Le Plateau-Mont-Royal",
      "Montréal Le Plateau-Mont-Royal"
    ],
    "google_places_query": "Le Plateau-Mont-Royal, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-le-sud-ouest",
    "name": "Le Sud-Ouest",
    "slug": "le-sud-ouest",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 21,
    "search_terms": [
      "le sud-ouest",
      "le sud ouest",
      "montréal"
    ],
    "aliases": [
      "Le Sud-Ouest",
      "Montréal Le Sud-Ouest"
    ],
    "google_places_query": "Le Sud-Ouest, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-mercier-hochelaga-maisonneuve",
    "name": "Mercier–Hochelaga-Maisonneuve",
    "slug": "mercier-hochelaga-maisonneuve",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 22,
    "search_terms": [
      "mercierhochelaga-maisonneuve",
      "mercier–hochelaga-maisonneuve",
      "mercier hochelaga maisonneuve",
      "montréal"
    ],
    "aliases": [
      "Mercier–Hochelaga-Maisonneuve",
      "Montréal Mercier–Hochelaga-Maisonneuve"
    ],
    "google_places_query": "Mercier–Hochelaga-Maisonneuve, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-montreal-nord",
    "name": "Montréal-Nord",
    "slug": "montreal-nord",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 23,
    "search_terms": [
      "montreal-nord",
      "montreal nord",
      "montréal-nord",
      "montréal"
    ],
    "aliases": [
      "Montréal-Nord",
      "Montréal Montréal-Nord"
    ],
    "google_places_query": "Montréal-Nord, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-outremont",
    "name": "Outremont",
    "slug": "outremont",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 24,
    "search_terms": [
      "outremont",
      "montréal"
    ],
    "aliases": [
      "Outremont",
      "Montréal Outremont"
    ],
    "google_places_query": "Outremont, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-pierrefonds-roxboro",
    "name": "Pierrefonds-Roxboro",
    "slug": "pierrefonds-roxboro",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 25,
    "search_terms": [
      "pierrefonds roxboro",
      "pierrefonds-roxboro",
      "montréal"
    ],
    "aliases": [
      "Pierrefonds-Roxboro",
      "Montréal Pierrefonds-Roxboro"
    ],
    "google_places_query": "Pierrefonds-Roxboro, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-riviere-des-prairies-pointe-aux-trembles",
    "name": "Rivière-des-Prairies–Pointe-aux-Trembles",
    "slug": "riviere-des-prairies-pointe-aux-trembles",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 26,
    "search_terms": [
      "riviere des prairies pointe aux trembles",
      "rivière-des-prairies–pointe-aux-trembles",
      "riviere-des-prairiespointe-aux-trembles",
      "montréal"
    ],
    "aliases": [
      "Rivière-des-Prairies–Pointe-aux-Trembles",
      "Montréal Rivière-des-Prairies–Pointe-aux-Trembles"
    ],
    "google_places_query": "Rivière-des-Prairies–Pointe-aux-Trembles, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-rosemont-la-petite-patrie",
    "name": "Rosemont–La Petite-Patrie",
    "slug": "rosemont-la-petite-patrie",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 27,
    "search_terms": [
      "rosemontla petite-patrie",
      "rosemont la petite patrie",
      "montréal",
      "rosemont–la petite-patrie"
    ],
    "aliases": [
      "Rosemont–La Petite-Patrie",
      "Montréal Rosemont–La Petite-Patrie"
    ],
    "google_places_query": "Rosemont–La Petite-Patrie, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-saint-laurent",
    "name": "Saint-Laurent",
    "slug": "saint-laurent",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 28,
    "search_terms": [
      "saint-laurent",
      "saint laurent",
      "montréal"
    ],
    "aliases": [
      "Saint-Laurent",
      "Montréal Saint-Laurent"
    ],
    "google_places_query": "Saint-Laurent, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-saint-leonard",
    "name": "Saint-Léonard",
    "slug": "saint-leonard",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 29,
    "search_terms": [
      "saint-leonard",
      "saint leonard",
      "saint-léonard",
      "montréal"
    ],
    "aliases": [
      "Saint-Léonard",
      "Montréal Saint-Léonard"
    ],
    "google_places_query": "Saint-Léonard, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-verdun",
    "name": "Verdun",
    "slug": "verdun",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 30,
    "search_terms": [
      "verdun",
      "montréal"
    ],
    "aliases": [
      "Verdun",
      "Montréal Verdun"
    ],
    "google_places_query": "Verdun, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-ville-marie",
    "name": "Ville-Marie",
    "slug": "ville-marie",
    "type": "borough",
    "city": "Montréal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 31,
    "search_terms": [
      "ville marie",
      "montréal",
      "ville-marie"
    ],
    "aliases": [
      "Ville-Marie",
      "Montréal Ville-Marie"
    ],
    "google_places_query": "Ville-Marie, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-ahuntsic",
    "name": "Ahuntsic",
    "slug": "ahuntsic",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Ahuntsic-Cartierville",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 32,
    "search_terms": [
      "ahuntsic",
      "ahuntsic-cartierville",
      "montréal"
    ],
    "aliases": [
      "Ahuntsic",
      "Montréal Ahuntsic"
    ],
    "google_places_query": "Ahuntsic, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-cartierville",
    "name": "Cartierville",
    "slug": "cartierville",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Ahuntsic-Cartierville",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 33,
    "search_terms": [
      "ahuntsic-cartierville",
      "cartierville",
      "montréal"
    ],
    "aliases": [
      "Cartierville",
      "Montréal Cartierville"
    ],
    "google_places_query": "Cartierville, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-villeray",
    "name": "Villeray",
    "slug": "villeray",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Villeray-Saint-Michel-Parc-Extension",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 34,
    "search_terms": [
      "villeray-saint-michel-parc-extension",
      "montréal",
      "villeray"
    ],
    "aliases": [
      "Villeray",
      "Montréal Villeray"
    ],
    "google_places_query": "Villeray, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-saint-michel",
    "name": "Saint-Michel",
    "slug": "saint-michel",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Villeray-Saint-Michel-Parc-Extension",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 35,
    "search_terms": [
      "villeray-saint-michel-parc-extension",
      "saint michel",
      "saint-michel",
      "montréal"
    ],
    "aliases": [
      "Saint-Michel",
      "Montréal Saint-Michel"
    ],
    "google_places_query": "Saint-Michel, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-parc-extension",
    "name": "Parc-Extension",
    "slug": "parc-extension",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Villeray-Saint-Michel-Parc-Extension",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 36,
    "search_terms": [
      "villeray-saint-michel-parc-extension",
      "parc extension",
      "montréal",
      "parc-extension"
    ],
    "aliases": [
      "Parc-Extension",
      "Montréal Parc-Extension"
    ],
    "google_places_query": "Parc-Extension, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-rosemont",
    "name": "Rosemont",
    "slug": "rosemont",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Rosemont–La Petite-Patrie",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 37,
    "search_terms": [
      "rosemont",
      "rosemont–la petite-patrie",
      "montréal"
    ],
    "aliases": [
      "Rosemont",
      "Montréal Rosemont"
    ],
    "google_places_query": "Rosemont, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-petite-patrie",
    "name": "Petite-Patrie",
    "slug": "petite-patrie",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Rosemont–La Petite-Patrie",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 38,
    "search_terms": [
      "petite-patrie",
      "petite patrie",
      "montréal",
      "rosemont–la petite-patrie"
    ],
    "aliases": [
      "Petite-Patrie",
      "Montréal Petite-Patrie"
    ],
    "google_places_query": "Petite-Patrie, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-hochelaga",
    "name": "Hochelaga",
    "slug": "hochelaga",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Mercier–Hochelaga-Maisonneuve",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 39,
    "search_terms": [
      "hochelaga",
      "mercier–hochelaga-maisonneuve",
      "montréal"
    ],
    "aliases": [
      "Hochelaga",
      "Montréal Hochelaga"
    ],
    "google_places_query": "Hochelaga, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-maisonneuve",
    "name": "Maisonneuve",
    "slug": "maisonneuve",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Mercier–Hochelaga-Maisonneuve",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 40,
    "search_terms": [
      "mercier–hochelaga-maisonneuve",
      "maisonneuve",
      "montréal"
    ],
    "aliases": [
      "Maisonneuve",
      "Montréal Maisonneuve"
    ],
    "google_places_query": "Maisonneuve, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-tetreaultville",
    "name": "Tétreaultville",
    "slug": "tetreaultville",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Mercier–Hochelaga-Maisonneuve",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 41,
    "search_terms": [
      "mercier–hochelaga-maisonneuve",
      "tetreaultville",
      "montréal",
      "tétreaultville"
    ],
    "aliases": [
      "Tétreaultville",
      "Montréal Tétreaultville"
    ],
    "google_places_query": "Tétreaultville, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-cote-des-neiges",
    "name": "Côte-des-Neiges",
    "slug": "cote-des-neiges",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Côte-des-Neiges–Notre-Dame-de-Grâce",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 42,
    "search_terms": [
      "côte-des-neiges",
      "cote des neiges",
      "cote-des-neiges",
      "montréal",
      "côte-des-neiges–notre-dame-de-grâce"
    ],
    "aliases": [
      "Côte-des-Neiges",
      "Montréal Côte-des-Neiges"
    ],
    "google_places_query": "Côte-des-Neiges, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-notre-dame-de-grace",
    "name": "Notre-Dame-de-Grâce",
    "slug": "notre-dame-de-grace",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Côte-des-Neiges–Notre-Dame-de-Grâce",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 43,
    "search_terms": [
      "notre-dame-de-grace",
      "notre dame de grace",
      "notre-dame-de-grâce",
      "montréal",
      "côte-des-neiges–notre-dame-de-grâce"
    ],
    "aliases": [
      "Notre-Dame-de-Grâce",
      "Montréal Notre-Dame-de-Grâce"
    ],
    "google_places_query": "Notre-Dame-de-Grâce, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-plateau-mont-royal-sector",
    "name": "Plateau-Mont-Royal",
    "slug": "plateau-mont-royal-sector",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Le Plateau-Mont-Royal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 44,
    "search_terms": [
      "plateau-mont-royal",
      "montréal",
      "le plateau-mont-royal",
      "plateau mont royal sector"
    ],
    "aliases": [
      "Plateau-Mont-Royal",
      "Montréal Plateau-Mont-Royal"
    ],
    "google_places_query": "Plateau-Mont-Royal, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-mile-end",
    "name": "Mile-End",
    "slug": "mile-end",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Le Plateau-Mont-Royal",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 45,
    "search_terms": [
      "mile-end",
      "mile end",
      "montréal",
      "le plateau-mont-royal"
    ],
    "aliases": [
      "Mile-End",
      "Montréal Mile-End"
    ],
    "google_places_query": "Mile-End, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-centre-ville",
    "name": "Centre-ville",
    "slug": "centre-ville",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Ville-Marie",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 46,
    "search_terms": [
      "ville-marie",
      "montréal",
      "centre-ville",
      "centre ville"
    ],
    "aliases": [
      "Centre-ville",
      "Montréal Centre-ville"
    ],
    "google_places_query": "Centre-ville, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-vieux-montreal",
    "name": "Vieux-Montréal",
    "slug": "vieux-montreal",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Ville-Marie",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 47,
    "search_terms": [
      "vieux-montréal",
      "ville-marie",
      "vieux montreal",
      "vieux-montreal",
      "montréal"
    ],
    "aliases": [
      "Vieux-Montréal",
      "Montréal Vieux-Montréal"
    ],
    "google_places_query": "Vieux-Montréal, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-griffintown",
    "name": "Griffintown",
    "slug": "griffintown",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Le Sud-Ouest",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 48,
    "search_terms": [
      "le sud-ouest",
      "griffintown",
      "montréal"
    ],
    "aliases": [
      "Griffintown",
      "Montréal Griffintown"
    ],
    "google_places_query": "Griffintown, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-saint-henri",
    "name": "Saint-Henri",
    "slug": "saint-henri",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Le Sud-Ouest",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 49,
    "search_terms": [
      "saint henri",
      "le sud-ouest",
      "saint-henri",
      "montréal"
    ],
    "aliases": [
      "Saint-Henri",
      "Montréal Saint-Henri"
    ],
    "google_places_query": "Saint-Henri, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-petite-bourgogne",
    "name": "Petite-Bourgogne",
    "slug": "petite-bourgogne",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Le Sud-Ouest",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 50,
    "search_terms": [
      "le sud-ouest",
      "petite-bourgogne",
      "petite bourgogne",
      "montréal"
    ],
    "aliases": [
      "Petite-Bourgogne",
      "Montréal Petite-Bourgogne"
    ],
    "google_places_query": "Petite-Bourgogne, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-pointe-saint-charles",
    "name": "Pointe-Saint-Charles",
    "slug": "pointe-saint-charles",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Le Sud-Ouest",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 51,
    "search_terms": [
      "le sud-ouest",
      "pointe-saint-charles",
      "montréal",
      "pointe saint charles"
    ],
    "aliases": [
      "Pointe-Saint-Charles",
      "Montréal Pointe-Saint-Charles"
    ],
    "google_places_query": "Pointe-Saint-Charles, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "montreal-sa-ile-des-soeurs",
    "name": "Île-des-Sœurs",
    "slug": "ile-des-soeurs",
    "type": "service_area",
    "city": "Montréal",
    "parent_borough": "Verdun",
    "region": "montreal",
    "region_code": "QC-MTL",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "montreal",
    "sort_order": 52,
    "search_terms": [
      "île-des-sœurs",
      "ile des soeurs",
      "verdun",
      "ile-des-surs",
      "montréal"
    ],
    "aliases": [
      "Île-des-Sœurs",
      "Montréal Île-des-Sœurs"
    ],
    "google_places_query": "Île-des-Sœurs, Montréal, QC, Canada",
    "delivery_fee": 4.99,
    "min_order": 10.0,
    "estimated_time_min": 25,
    "estimated_time_max": 40
  },
  {
    "id": "longueuil-vieux-longueuil",
    "name": "Vieux-Longueuil",
    "slug": "vieux-longueuil",
    "type": "borough",
    "city": "Longueuil",
    "parent_city": "Longueuil",
    "region": "longueuil",
    "region_code": "QC-LON",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "longueuil",
    "sort_order": 53,
    "search_terms": [
      "vieux longueuil",
      "longueuil",
      "vieux-longueuil"
    ],
    "aliases": [
      "Vieux-Longueuil",
      "Longueuil Vieux-Longueuil"
    ],
    "google_places_query": "Vieux-Longueuil, Longueuil, QC, Canada",
    "delivery_fee": 5.99,
    "min_order": 12.0,
    "estimated_time_min": 25,
    "estimated_time_max": 45
  },
  {
    "id": "longueuil-saint-hubert",
    "name": "Saint-Hubert",
    "slug": "saint-hubert",
    "type": "borough",
    "city": "Longueuil",
    "parent_city": "Longueuil",
    "region": "longueuil",
    "region_code": "QC-LON",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "longueuil",
    "sort_order": 54,
    "search_terms": [
      "saint-hubert",
      "longueuil",
      "saint hubert"
    ],
    "aliases": [
      "Saint-Hubert",
      "Longueuil Saint-Hubert"
    ],
    "google_places_query": "Saint-Hubert, Longueuil, QC, Canada",
    "delivery_fee": 5.99,
    "min_order": 12.0,
    "estimated_time_min": 25,
    "estimated_time_max": 45
  },
  {
    "id": "longueuil-greenfield-park",
    "name": "Greenfield Park",
    "slug": "greenfield-park",
    "type": "borough",
    "city": "Longueuil",
    "parent_city": "Longueuil",
    "region": "longueuil",
    "region_code": "QC-LON",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "longueuil",
    "sort_order": 55,
    "search_terms": [
      "longueuil",
      "greenfield park"
    ],
    "aliases": [
      "Greenfield Park",
      "Longueuil Greenfield Park"
    ],
    "google_places_query": "Greenfield Park, Longueuil, QC, Canada",
    "delivery_fee": 5.99,
    "min_order": 12.0,
    "estimated_time_min": 25,
    "estimated_time_max": 45
  },
  {
    "id": "longueuil-agg-brossard",
    "name": "Brossard",
    "slug": "brossard",
    "type": "linked_city",
    "city": "Brossard",
    "region": "longueuil",
    "region_code": "QC-LON",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "longueuil",
    "sort_order": 56,
    "search_terms": [
      "rive-sud",
      "brossard"
    ],
    "aliases": [
      "Brossard"
    ],
    "google_places_query": "Brossard, QC, Canada",
    "delivery_fee": 5.99,
    "min_order": 12.0,
    "estimated_time_min": 30,
    "estimated_time_max": 50
  },
  {
    "id": "longueuil-agg-boucherville",
    "name": "Boucherville",
    "slug": "boucherville",
    "type": "linked_city",
    "city": "Boucherville",
    "region": "longueuil",
    "region_code": "QC-LON",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "longueuil",
    "sort_order": 57,
    "search_terms": [
      "boucherville",
      "rive-sud"
    ],
    "aliases": [
      "Boucherville"
    ],
    "google_places_query": "Boucherville, QC, Canada",
    "delivery_fee": 5.99,
    "min_order": 12.0,
    "estimated_time_min": 30,
    "estimated_time_max": 50
  },
  {
    "id": "longueuil-agg-saint-bruno-de-montarville",
    "name": "Saint-Bruno-de-Montarville",
    "slug": "saint-bruno-de-montarville",
    "type": "linked_city",
    "city": "Saint-Bruno-de-Montarville",
    "region": "longueuil",
    "region_code": "QC-LON",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "longueuil",
    "sort_order": 58,
    "search_terms": [
      "saint bruno de montarville",
      "saint-bruno-de-montarville",
      "rive-sud"
    ],
    "aliases": [
      "Saint-Bruno-de-Montarville"
    ],
    "google_places_query": "Saint-Bruno-de-Montarville, QC, Canada",
    "delivery_fee": 5.99,
    "min_order": 12.0,
    "estimated_time_min": 30,
    "estimated_time_max": 50
  },
  {
    "id": "longueuil-agg-saint-lambert",
    "name": "Saint-Lambert",
    "slug": "saint-lambert",
    "type": "linked_city",
    "city": "Saint-Lambert",
    "region": "longueuil",
    "region_code": "QC-LON",
    "is_core": true,
    "is_active": true,
    "delivery_zone_group": "longueuil",
    "sort_order": 59,
    "search_terms": [
      "saint lambert",
      "rive-sud",
      "saint-lambert"
    ],
    "aliases": [
      "Saint-Lambert"
    ],
    "google_places_query": "Saint-Lambert, QC, Canada",
    "delivery_fee": 5.99,
    "min_order": 12.0,
    "estimated_time_min": 30,
    "estimated_time_max": 50
  },
  {
    "id": "outside-saint-jerome",
    "name": "Saint-Jérôme",
    "slug": "saint-jerome",
    "type": "city",
    "city": "Saint-Jérôme",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 60,
    "search_terms": [
      "grand montréal",
      "saint-jérôme",
      "saint-jerome",
      "saint jerome"
    ],
    "aliases": [
      "Saint-Jérôme"
    ],
    "google_places_query": "Saint-Jérôme, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-saint-colomban",
    "name": "Saint-Colomban",
    "slug": "saint-colomban",
    "type": "city",
    "city": "Saint-Colomban",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 61,
    "search_terms": [
      "saint-colomban",
      "saint colomban",
      "grand montréal"
    ],
    "aliases": [
      "Saint-Colomban"
    ],
    "google_places_query": "Saint-Colomban, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-mirabel",
    "name": "Mirabel",
    "slug": "mirabel",
    "type": "city",
    "city": "Mirabel",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 62,
    "search_terms": [
      "mirabel",
      "grand montréal"
    ],
    "aliases": [
      "Mirabel"
    ],
    "google_places_query": "Mirabel, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-blainville",
    "name": "Blainville",
    "slug": "blainville",
    "type": "city",
    "city": "Blainville",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 63,
    "search_terms": [
      "blainville",
      "grand montréal"
    ],
    "aliases": [
      "Blainville"
    ],
    "google_places_query": "Blainville, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-sainte-anne-des-plaines",
    "name": "Sainte-Anne-des-Plaines",
    "slug": "sainte-anne-des-plaines",
    "type": "city",
    "city": "Sainte-Anne-des-Plaines",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 64,
    "search_terms": [
      "sainte anne des plaines",
      "grand montréal",
      "sainte-anne-des-plaines"
    ],
    "aliases": [
      "Sainte-Anne-des-Plaines"
    ],
    "google_places_query": "Sainte-Anne-des-Plaines, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-terrebonne",
    "name": "Terrebonne",
    "slug": "terrebonne",
    "type": "city",
    "city": "Terrebonne",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 65,
    "search_terms": [
      "terrebonne",
      "grand montréal"
    ],
    "aliases": [
      "Terrebonne"
    ],
    "google_places_query": "Terrebonne, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-mascouche",
    "name": "Mascouche",
    "slug": "mascouche",
    "type": "city",
    "city": "Mascouche",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 66,
    "search_terms": [
      "grand montréal",
      "mascouche"
    ],
    "aliases": [
      "Mascouche"
    ],
    "google_places_query": "Mascouche, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-repentigny",
    "name": "Repentigny",
    "slug": "repentigny",
    "type": "city",
    "city": "Repentigny",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 67,
    "search_terms": [
      "grand montréal",
      "repentigny"
    ],
    "aliases": [
      "Repentigny"
    ],
    "google_places_query": "Repentigny, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-lassomption",
    "name": "L'Assomption",
    "slug": "lassomption",
    "type": "city",
    "city": "L'Assomption",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 68,
    "search_terms": [
      "l'assomption",
      "grand montréal",
      "lassomption"
    ],
    "aliases": [
      "L'Assomption"
    ],
    "google_places_query": "L'Assomption, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-lepiphanie",
    "name": "L'Épiphanie",
    "slug": "lepiphanie",
    "type": "city",
    "city": "L'Épiphanie",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 69,
    "search_terms": [
      "l'épiphanie",
      "lepiphanie",
      "grand montréal",
      "l'epiphanie"
    ],
    "aliases": [
      "L'Épiphanie"
    ],
    "google_places_query": "L'Épiphanie, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-lavaltrie",
    "name": "Lavaltrie",
    "slug": "lavaltrie",
    "type": "city",
    "city": "Lavaltrie",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 70,
    "search_terms": [
      "grand montréal",
      "lavaltrie"
    ],
    "aliases": [
      "Lavaltrie"
    ],
    "google_places_query": "Lavaltrie, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-saint-sulpice",
    "name": "Saint-Sulpice",
    "slug": "saint-sulpice",
    "type": "city",
    "city": "Saint-Sulpice",
    "region": "north_shore",
    "region_code": "QC-NOR",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "north_shore",
    "sort_order": 71,
    "search_terms": [
      "saint-sulpice",
      "saint sulpice",
      "grand montréal"
    ],
    "aliases": [
      "Saint-Sulpice"
    ],
    "google_places_query": "Saint-Sulpice, QC, Canada",
    "delivery_fee": 6.99,
    "min_order": 14.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-saint-eustache",
    "name": "Saint-Eustache",
    "slug": "saint-eustache",
    "type": "city",
    "city": "Saint-Eustache",
    "region": "west_north_shore",
    "region_code": "QC-WNS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_north_shore",
    "sort_order": 72,
    "search_terms": [
      "grand montréal",
      "saint-eustache",
      "saint eustache"
    ],
    "aliases": [
      "Saint-Eustache"
    ],
    "google_places_query": "Saint-Eustache, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-deux-montagnes",
    "name": "Deux-Montagnes",
    "slug": "deux-montagnes",
    "type": "city",
    "city": "Deux-Montagnes",
    "region": "west_north_shore",
    "region_code": "QC-WNS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_north_shore",
    "sort_order": 73,
    "search_terms": [
      "deux-montagnes",
      "grand montréal",
      "deux montagnes"
    ],
    "aliases": [
      "Deux-Montagnes"
    ],
    "google_places_query": "Deux-Montagnes, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-sainte-marthe-sur-le-lac",
    "name": "Sainte-Marthe-sur-le-Lac",
    "slug": "sainte-marthe-sur-le-lac",
    "type": "city",
    "city": "Sainte-Marthe-sur-le-Lac",
    "region": "west_north_shore",
    "region_code": "QC-WNS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_north_shore",
    "sort_order": 74,
    "search_terms": [
      "sainte marthe sur le lac",
      "grand montréal",
      "sainte-marthe-sur-le-lac"
    ],
    "aliases": [
      "Sainte-Marthe-sur-le-Lac"
    ],
    "google_places_query": "Sainte-Marthe-sur-le-Lac, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-saint-joseph-du-lac",
    "name": "Saint-Joseph-du-Lac",
    "slug": "saint-joseph-du-lac",
    "type": "city",
    "city": "Saint-Joseph-du-Lac",
    "region": "west_north_shore",
    "region_code": "QC-WNS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_north_shore",
    "sort_order": 75,
    "search_terms": [
      "saint-joseph-du-lac",
      "grand montréal",
      "saint joseph du lac"
    ],
    "aliases": [
      "Saint-Joseph-du-Lac"
    ],
    "google_places_query": "Saint-Joseph-du-Lac, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-oka",
    "name": "Oka",
    "slug": "oka",
    "type": "municipality",
    "city": "Oka",
    "region": "west_north_shore",
    "region_code": "QC-WNS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_north_shore",
    "sort_order": 76,
    "search_terms": [
      "oka",
      "grand montréal"
    ],
    "aliases": [
      "Oka"
    ],
    "google_places_query": "Oka, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-saint-placide",
    "name": "Saint-Placide",
    "slug": "saint-placide",
    "type": "municipality",
    "city": "Saint-Placide",
    "region": "west_north_shore",
    "region_code": "QC-WNS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_north_shore",
    "sort_order": 77,
    "search_terms": [
      "grand montréal",
      "saint placide",
      "saint-placide"
    ],
    "aliases": [
      "Saint-Placide"
    ],
    "google_places_query": "Saint-Placide, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-pointe-calumet",
    "name": "Pointe-Calumet",
    "slug": "pointe-calumet",
    "type": "municipality",
    "city": "Pointe-Calumet",
    "region": "west_north_shore",
    "region_code": "QC-WNS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_north_shore",
    "sort_order": 78,
    "search_terms": [
      "pointe calumet",
      "grand montréal",
      "pointe-calumet"
    ],
    "aliases": [
      "Pointe-Calumet"
    ],
    "google_places_query": "Pointe-Calumet, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-hudson",
    "name": "Hudson",
    "slug": "hudson",
    "type": "city",
    "city": "Hudson",
    "region": "west_extended",
    "region_code": "QC-WEX",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_extended",
    "sort_order": 79,
    "search_terms": [
      "hudson",
      "grand montréal"
    ],
    "aliases": [
      "Hudson"
    ],
    "google_places_query": "Hudson, QC, Canada",
    "delivery_fee": 8.99,
    "min_order": 20.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-saint-lazare",
    "name": "Saint-Lazare",
    "slug": "saint-lazare",
    "type": "city",
    "city": "Saint-Lazare",
    "region": "west_extended",
    "region_code": "QC-WEX",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_extended",
    "sort_order": 80,
    "search_terms": [
      "grand montréal",
      "saint-lazare",
      "saint lazare"
    ],
    "aliases": [
      "Saint-Lazare"
    ],
    "google_places_query": "Saint-Lazare, QC, Canada",
    "delivery_fee": 8.99,
    "min_order": 20.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-vaudreuil-dorion",
    "name": "Vaudreuil-Dorion",
    "slug": "vaudreuil-dorion",
    "type": "city",
    "city": "Vaudreuil-Dorion",
    "region": "west_extended",
    "region_code": "QC-WEX",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_extended",
    "sort_order": 81,
    "search_terms": [
      "grand montréal",
      "vaudreuil dorion",
      "vaudreuil-dorion"
    ],
    "aliases": [
      "Vaudreuil-Dorion"
    ],
    "google_places_query": "Vaudreuil-Dorion, QC, Canada",
    "delivery_fee": 8.99,
    "min_order": 20.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-terrasse-vaudreuil",
    "name": "Terrasse-Vaudreuil",
    "slug": "terrasse-vaudreuil",
    "type": "municipality",
    "city": "Terrasse-Vaudreuil",
    "region": "west_extended",
    "region_code": "QC-WEX",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_extended",
    "sort_order": 82,
    "search_terms": [
      "grand montréal",
      "terrasse vaudreuil",
      "terrasse-vaudreuil"
    ],
    "aliases": [
      "Terrasse-Vaudreuil"
    ],
    "google_places_query": "Terrasse-Vaudreuil, QC, Canada",
    "delivery_fee": 8.99,
    "min_order": 20.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-notre-dame-de-lile-perrot",
    "name": "Notre-Dame-de-l'Île-Perrot",
    "slug": "notre-dame-de-lile-perrot",
    "type": "city",
    "city": "Notre-Dame-de-l'Île-Perrot",
    "region": "west_extended",
    "region_code": "QC-WEX",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_extended",
    "sort_order": 83,
    "search_terms": [
      "grand montréal",
      "notre-dame-de-l'ile-perrot",
      "notre-dame-de-l'île-perrot",
      "notre dame de lile perrot"
    ],
    "aliases": [
      "Notre-Dame-de-l'Île-Perrot"
    ],
    "google_places_query": "Notre-Dame-de-l'Île-Perrot, QC, Canada",
    "delivery_fee": 8.99,
    "min_order": 20.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-les-cedres",
    "name": "Les Cèdres",
    "slug": "les-cedres",
    "type": "municipality",
    "city": "Les Cèdres",
    "region": "west_extended",
    "region_code": "QC-WEX",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_extended",
    "sort_order": 84,
    "search_terms": [
      "grand montréal",
      "les cèdres",
      "les cedres"
    ],
    "aliases": [
      "Les Cèdres"
    ],
    "google_places_query": "Les Cèdres, QC, Canada",
    "delivery_fee": 8.99,
    "min_order": 20.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-coteau-du-lac",
    "name": "Coteau-du-Lac",
    "slug": "coteau-du-lac",
    "type": "city",
    "city": "Coteau-du-Lac",
    "region": "west_extended",
    "region_code": "QC-WEX",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_extended",
    "sort_order": 85,
    "search_terms": [
      "coteau-du-lac",
      "grand montréal",
      "coteau du lac"
    ],
    "aliases": [
      "Coteau-du-Lac"
    ],
    "google_places_query": "Coteau-du-Lac, QC, Canada",
    "delivery_fee": 8.99,
    "min_order": 20.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-les-coteaux",
    "name": "Les Coteaux",
    "slug": "les-coteaux",
    "type": "municipality",
    "city": "Les Coteaux",
    "region": "west_extended",
    "region_code": "QC-WEX",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_extended",
    "sort_order": 86,
    "search_terms": [
      "grand montréal",
      "les coteaux"
    ],
    "aliases": [
      "Les Coteaux"
    ],
    "google_places_query": "Les Coteaux, QC, Canada",
    "delivery_fee": 8.99,
    "min_order": 20.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-saint-zotique",
    "name": "Saint-Zotique",
    "slug": "saint-zotique",
    "type": "municipality",
    "city": "Saint-Zotique",
    "region": "west_extended",
    "region_code": "QC-WEX",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "west_extended",
    "sort_order": 87,
    "search_terms": [
      "saint zotique",
      "grand montréal",
      "saint-zotique"
    ],
    "aliases": [
      "Saint-Zotique"
    ],
    "google_places_query": "Saint-Zotique, QC, Canada",
    "delivery_fee": 8.99,
    "min_order": 20.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-varennes",
    "name": "Varennes",
    "slug": "varennes",
    "type": "city",
    "city": "Varennes",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 88,
    "search_terms": [
      "grand montréal",
      "varennes"
    ],
    "aliases": [
      "Varennes"
    ],
    "google_places_query": "Varennes, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-vercheres",
    "name": "Verchères",
    "slug": "vercheres",
    "type": "municipality",
    "city": "Verchères",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 89,
    "search_terms": [
      "grand montréal",
      "vercheres",
      "verchères"
    ],
    "aliases": [
      "Verchères"
    ],
    "google_places_query": "Verchères, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-sainte-julie",
    "name": "Sainte-Julie",
    "slug": "sainte-julie",
    "type": "city",
    "city": "Sainte-Julie",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 90,
    "search_terms": [
      "sainte-julie",
      "grand montréal",
      "sainte julie"
    ],
    "aliases": [
      "Sainte-Julie"
    ],
    "google_places_query": "Sainte-Julie, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-saint-amable",
    "name": "Saint-Amable",
    "slug": "saint-amable",
    "type": "city",
    "city": "Saint-Amable",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 91,
    "search_terms": [
      "saint amable",
      "grand montréal",
      "saint-amable"
    ],
    "aliases": [
      "Saint-Amable"
    ],
    "google_places_query": "Saint-Amable, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-saint-mathieu-de-beloeil",
    "name": "Saint-Mathieu-de-Beloeil",
    "slug": "saint-mathieu-de-beloeil",
    "type": "municipality",
    "city": "Saint-Mathieu-de-Beloeil",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 92,
    "search_terms": [
      "grand montréal",
      "saint mathieu de beloeil",
      "saint-mathieu-de-beloeil"
    ],
    "aliases": [
      "Saint-Mathieu-de-Beloeil"
    ],
    "google_places_query": "Saint-Mathieu-de-Beloeil, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-beloeil",
    "name": "Beloeil",
    "slug": "beloeil",
    "type": "city",
    "city": "Beloeil",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 93,
    "search_terms": [
      "beloeil",
      "grand montréal"
    ],
    "aliases": [
      "Beloeil"
    ],
    "google_places_query": "Beloeil, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-mcmasterville",
    "name": "McMasterville",
    "slug": "mcmasterville",
    "type": "municipality",
    "city": "McMasterville",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 94,
    "search_terms": [
      "grand montréal",
      "mcmasterville"
    ],
    "aliases": [
      "McMasterville"
    ],
    "google_places_query": "McMasterville, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-otterburn-park",
    "name": "Otterburn Park",
    "slug": "otterburn-park",
    "type": "city",
    "city": "Otterburn Park",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 95,
    "search_terms": [
      "otterburn park",
      "grand montréal"
    ],
    "aliases": [
      "Otterburn Park"
    ],
    "google_places_query": "Otterburn Park, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-mont-saint-hilaire",
    "name": "Mont-Saint-Hilaire",
    "slug": "mont-saint-hilaire",
    "type": "city",
    "city": "Mont-Saint-Hilaire",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 96,
    "search_terms": [
      "mont-saint-hilaire",
      "grand montréal",
      "mont saint hilaire"
    ],
    "aliases": [
      "Mont-Saint-Hilaire"
    ],
    "google_places_query": "Mont-Saint-Hilaire, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-carignan",
    "name": "Carignan",
    "slug": "carignan",
    "type": "city",
    "city": "Carignan",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 97,
    "search_terms": [
      "grand montréal",
      "carignan"
    ],
    "aliases": [
      "Carignan"
    ],
    "google_places_query": "Carignan, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-chambly",
    "name": "Chambly",
    "slug": "chambly",
    "type": "city",
    "city": "Chambly",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 98,
    "search_terms": [
      "chambly",
      "grand montréal"
    ],
    "aliases": [
      "Chambly"
    ],
    "google_places_query": "Chambly, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-richelieu",
    "name": "Richelieu",
    "slug": "richelieu",
    "type": "city",
    "city": "Richelieu",
    "region": "south_shore_east",
    "region_code": "QC-SSE",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_shore_east",
    "sort_order": 99,
    "search_terms": [
      "grand montréal",
      "richelieu"
    ],
    "aliases": [
      "Richelieu"
    ],
    "google_places_query": "Richelieu, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-chateauguay",
    "name": "Châteauguay",
    "slug": "chateauguay",
    "type": "city",
    "city": "Châteauguay",
    "region": "south_west",
    "region_code": "QC-SWS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_west",
    "sort_order": 100,
    "search_terms": [
      "grand montréal",
      "chateauguay",
      "châteauguay"
    ],
    "aliases": [
      "Châteauguay"
    ],
    "google_places_query": "Châteauguay, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-lery",
    "name": "Léry",
    "slug": "lery",
    "type": "city",
    "city": "Léry",
    "region": "south_west",
    "region_code": "QC-SWS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_west",
    "sort_order": 101,
    "search_terms": [
      "grand montréal",
      "lery",
      "léry"
    ],
    "aliases": [
      "Léry"
    ],
    "google_places_query": "Léry, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-mercier",
    "name": "Mercier",
    "slug": "mercier",
    "type": "city",
    "city": "Mercier",
    "region": "south_west",
    "region_code": "QC-SWS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_west",
    "sort_order": 102,
    "search_terms": [
      "grand montréal",
      "mercier"
    ],
    "aliases": [
      "Mercier"
    ],
    "google_places_query": "Mercier, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  },
  {
    "id": "outside-beauharnois",
    "name": "Beauharnois",
    "slug": "beauharnois",
    "type": "city",
    "city": "Beauharnois",
    "region": "south_west",
    "region_code": "QC-SWS",
    "is_core": false,
    "is_active": false,
    "delivery_zone_group": "south_west",
    "sort_order": 103,
    "search_terms": [
      "beauharnois",
      "grand montréal"
    ],
    "aliases": [
      "Beauharnois"
    ],
    "google_places_query": "Beauharnois, QC, Canada",
    "delivery_fee": 7.99,
    "min_order": 15.0,
    "estimated_time_min": 40,
    "estimated_time_max": 60
  }
];

export const ACTIVE_ZONES = DELIVERY_ZONES.filter(z => z.is_active);
export const ZONE_GROUPS = [...new Set(DELIVERY_ZONES.map(z => z.delivery_zone_group))];

export function findZoneBySlug(slug: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find(z => z.slug === slug);
}

export function findZonesByGroup(group: string): DeliveryZone[] {
  return ACTIVE_ZONES.filter(z => z.delivery_zone_group === group);
}

export function searchZones(query: string): DeliveryZone[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];
  return ACTIVE_ZONES.filter(z =>
    z.name.toLowerCase().includes(q) ||
    z.search_terms.some(t => t.includes(q)) ||
    z.aliases.some(a => a.toLowerCase().includes(q))
  );
}

export function getNeighborZones(zoneId: string): DeliveryZone[] {
  const zone = DELIVERY_ZONES.find(z => z.id === zoneId);
  if (!zone) return [];
  return ACTIVE_ZONES.filter(z =>
    z.id !== zoneId &&
    (z.delivery_zone_group === zone.delivery_zone_group ||
     z.city === zone.city)
  ).slice(0, 5);
}
