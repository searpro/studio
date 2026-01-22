-- Seed system scenes for Studio

INSERT INTO "Scene" (id, name, description, category, "thumbnailUrl", "isSystem", "userId", "createdAt", "updatedAt")
VALUES
  (
    'scene_modern_loft',
    'Modern Loft',
    'A spacious modern loft with floor-to-ceiling windows, exposed brick walls, minimalist furniture, and abundant natural light streaming through large windows. Industrial-chic aesthetic with concrete floors and metal accents.',
    'INDOOR',
    NULL,
    true,
    NULL,
    NOW(),
    NOW()
  ),
  (
    'scene_neon_street',
    'Neon Street',
    'A vibrant cyberpunk street at night, illuminated by countless neon signs in Japanese and English. Rain-slicked pavement reflects pink, blue, and purple lights. Steam rises from grates, and holographic advertisements flicker overhead.',
    'URBAN',
    NULL,
    true,
    NULL,
    NOW(),
    NOW()
  ),
  (
    'scene_enchanted_forest',
    'Enchanted Forest',
    'An ancient mystical forest with towering trees whose branches form a natural cathedral. Bioluminescent mushrooms glow softly, fairy lights dance between branches, and a gentle mist hovers above moss-covered ground.',
    'FANTASY',
    NULL,
    true,
    NULL,
    NOW(),
    NOW()
  ),
  (
    'scene_space_station',
    'Space Station Observatory',
    'A futuristic space station observation deck with panoramic windows overlooking a stunning view of Earth and distant galaxies. Sleek metallic surfaces, holographic displays, and zero-gravity furniture create an otherworldly atmosphere.',
    'SCIFI',
    NULL,
    true,
    NULL,
    NOW(),
    NOW()
  ),
  (
    'scene_mountain_peak',
    'Mountain Peak',
    'A dramatic mountain summit at golden hour. Vast wilderness stretches below, with layers of mountain ranges fading into the distance. The sky is painted in brilliant oranges and purples, with a few wispy clouds catching the light.',
    'NATURE',
    NULL,
    true,
    NULL,
    NOW(),
    NOW()
  ),
  (
    'scene_coffee_shop',
    'Cozy Coffee Shop',
    'A charming independent coffee shop with warm wood interiors, vintage furniture, and walls lined with books. Soft Edison bulbs cast a golden glow, plants hang from exposed beams, and the aroma of fresh coffee fills the air.',
    'INDOOR',
    NULL,
    true,
    NULL,
    NOW(),
    NOW()
  );
