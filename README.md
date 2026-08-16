# Maison Palma — Thème Shopify (location de vaisselle de mariage)

Thème Shopify sur mesure (Online Store 2.0), inspiré dans sa structure du site
de La Pâtisserie Cyril Lignac (page d'accueil qui raconte l'histoire de la
maison puis descend vers les collections), adapté à un site de **location de
vaisselle de mariage** avec 3 formules (Éco / Premium / Luxe) et un choix à la
carte (fourchettes, couteaux, verres, assiettes, décoration), plus un
formulaire de demande de devis sur mesure.

Palette : camaïeu **Mocha Mousse** (beige lin, mocha, chocolat profond),
rehaussé d'or et d'un vert sauge, sur fond ivoire/porcelaine — d'après le
moodboard fourni.

## 1. Installer le thème sur votre boutique

Avec [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) :

```bash
shopify theme dev --store=votre-boutique.myshopify.com   # prévisualiser en local
shopify theme push --store=votre-boutique.myshopify.com  # publier sur la boutique
```

Vous pouvez aussi zipper le contenu de ce dépôt (sans le dossier `.git`) et
l'importer depuis **Boutique en ligne > Thèmes > Ajouter un thème > Importer
un fichier zip** dans l'admin Shopify.

## 2. Structure de navigation à créer

Dans **Boutique en ligne > Navigation**, créez (ou modifiez) le menu
`main-menu` (Menu principal) :

| Titre          | Lien                                   |
|----------------|------------------------------------------|
| Accueil        | `/`                                       |
| Notre histoire | `/#histoire`                              |
| Nos formules   | Menu déroulant → liens vers les 3 collections formules (voir ci-dessous) |
| À la carte     | Menu déroulant → liens vers les 5 collections catégories |
| Devis          | `/#devis` ou la page `/pages/devis`       |

Le header gère automatiquement les sous-menus (menus déroulants) : il suffit
d'imbriquer les liens dans l'éditeur de navigation Shopify.

## 3. Collections à créer

Créez ces collections (manuelles ou automatiques par tag) :

**Formules** — une collection par formule, chacune regroupant les produits de
ce niveau de gamme :
- `Formule Éco`
- `Formule Premium`
- `Formule Luxe`

**À la carte** — une collection par catégorie de pièce :
- `Fourchettes`
- `Couteaux`
- `Verres`
- `Assiettes`
- `Décoration`

Astuce : créez des collections **automatiques** basées sur les tags produits
(voir section 4) pour que le classement se fasse tout seul quand vous ajoutez
un produit.

## 4. Tags produits recommandés

Sur chaque produit (fiche vaisselle), ajoutez :
- un tag de gamme : `eco`, `premium` ou `luxe` — utilisé pour le badge coloré
  sur la fiche produit et pour les **filtres par formule** sur les pages
  collection (boutons "Éco / Premium / Luxe" en haut de la grille) ;
- éventuellement un tag `categorie:fourchette` (ou `couteau`, `verre`,
  `assiette`, `decoration`) si vous souhaitez affiner vos collections
  automatiques par catégorie.

## 5. Formulaire de devis

Le bloc « Devis sur mesure » (`sections/devis-form.liquid`) utilise le
formulaire de contact natif de Shopify. Les demandes arrivent par email à
l'adresse configurée dans **Réglages > Notifications > Formulaire de
contact** (en général l'email du propriétaire de la boutique). Chaque
demande contient : nom, email, téléphone, date de l'événement, nombre
d'invités, lieu, prestations cochées et message libre.

## 6. Personnalisation dans l'éditeur de thème

Tout est éditable sans code depuis **Boutique en ligne > Personnaliser** :
- **Couleurs** : réglages du thème > section « Couleurs » (palette Mocha
  Mousse pré-remplie, modifiable).
- **Polices** : réglages du thème > « Typographie » (titres en Cormorant,
  texte courant en Jost par défaut — changeables via le sélecteur de police
  Shopify).
- **Logo & favicon** : réglages du thème > « Logo & favicon ».
- **Page d'accueil** : chaque section (Hero, Notre histoire, Localisation,
  Formules, À la carte, Devis) est un bloc indépendant, réorganisable par
  glisser-déposer, avec ses propres images et textes.
- **Carte de localisation** : dans la section « Localisation », collez l'URL
  d'intégration Google Maps (Google Maps > Partager > Intégrer une carte >
  copier l'attribut `src` de l'iframe) dans le champ prévu.

## 7. Pages du panier

- Le panier s'ouvre par défaut en **tiroir latéral** (mise à jour en Ajax,
  sans rechargement de page). Vous pouvez basculer sur une **page dédiée**
  dans réglages du thème > « Panier ».
- Une page `/pages/devis` (modèle `page.devis`) est disponible si vous
  souhaitez un lien direct vers le formulaire de devis en dehors de la page
  d'accueil.

## 8. Arborescence du thème

```
layout/theme.liquid          Structure HTML globale, injection des couleurs/polices
sections/
  header.liquid, footer.liquid           Navigation, pied de page
  hero.liquid                            Bannière d'accueil
  story.liquid                           Notre histoire
  location.liquid                        Localisation / showroom
  formules.liquid                        Cartes Éco / Premium / Luxe
  a-la-carte.liquid                      Bandeau catégories (scroll fluide)
  devis-form.liquid                      Formulaire de devis sur mesure
  collection-hero.liquid, collection-grid.liquid   Pages collection (avec filtres)
  main-product.liquid                    Fiche produit
  main-cart.liquid, cart-drawer.liquid   Panier
  featured-collection.liquid, page-content.liquid
snippets/
  icon.liquid, product-card.liquid, cart-drawer-content.liquid
templates/                   Assemblage des sections par type de page (JSON)
assets/theme.css, theme.js   Design system et interactions (scroll fluide,
                              filtres, tiroir panier, variantes produit)
```

## Notes

Ce thème est un point de départ prêt à l'emploi mais nécessite l'ajout de vos
vrais produits, photos et textes depuis l'éditeur de thème avant mise en
ligne.
