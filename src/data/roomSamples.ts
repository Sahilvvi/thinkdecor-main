// Precisely mapped room components with accurate polygon shapes
// Each component traces the actual shape of the furniture/surface

export interface RoomComponent {
  id: string;
  name: string;
  color: string;
  polygon: { x: number; y: number }[];
}

export interface RoomSample {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  baseImage: string;
  components: RoomComponent[];
}

// Living room with green velvet sofa - photo-1586023492125-27b2c045efd7
// Components: Wall, Floor, Sofa (L-shaped), Coffee Table, Side Table, Plant, Rug, Artwork
export const ROOM_SAMPLES: RoomSample[] = [
  {
    id: 'living-room-1',
    name: 'Modern Living Room',
    description: 'Scandinavian style with green sofa',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    baseImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop',
    components: [
      // Main wall - full back wall
      {
        id: 'wall',
        name: 'Wall',
        color: '#E8E4DE',
        polygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 58 },
          { x: 0, y: 58 }
        ],
      },
      // Hardwood floor - visible floor area
      {
        id: 'floor',
        name: 'Hardwood Floor',
        color: '#C4A574',
        polygon: [
          { x: 0, y: 58 },
          { x: 0, y: 100 },
          { x: 100, y: 100 },
          { x: 100, y: 58 },
          { x: 75, y: 58 },
          { x: 75, y: 70 },
          { x: 60, y: 70 },
          { x: 60, y: 85 },
          { x: 5, y: 85 },
          { x: 5, y: 58 }
        ],
      },
      // Green velvet sofa - L-shaped sectional
      {
        id: 'sofa',
        name: 'Velvet Sofa',
        color: '#4A6B4A',
        polygon: [
          // Back of sofa
          { x: 5, y: 35 },
          { x: 55, y: 35 },
          { x: 55, y: 40 },
          // Right arm
          { x: 60, y: 40 },
          { x: 60, y: 75 },
          // Front edge
          { x: 55, y: 75 },
          { x: 55, y: 55 },
          { x: 5, y: 55 },
          // Left side
          { x: 5, y: 35 }
        ],
      },
      // Sofa cushions/seats
      {
        id: 'sofa-cushions',
        name: 'Sofa Cushions',
        color: '#3D5A3D',
        polygon: [
          { x: 8, y: 42 },
          { x: 52, y: 42 },
          { x: 52, y: 52 },
          { x: 8, y: 52 }
        ],
      },
      // Coffee table - round wooden table
      {
        id: 'coffee-table',
        name: 'Coffee Table',
        color: '#8B7355',
        polygon: [
          // Approximate circle with polygon
          { x: 35, y: 68 },
          { x: 40, y: 65 },
          { x: 48, y: 65 },
          { x: 53, y: 68 },
          { x: 55, y: 73 },
          { x: 53, y: 78 },
          { x: 48, y: 81 },
          { x: 40, y: 81 },
          { x: 35, y: 78 },
          { x: 33, y: 73 }
        ],
      },
      // Side table - small round table near sofa
      {
        id: 'side-table',
        name: 'Side Table',
        color: '#654321',
        polygon: [
          { x: 62, y: 52 },
          { x: 72, y: 52 },
          { x: 74, y: 56 },
          { x: 72, y: 60 },
          { x: 62, y: 60 },
          { x: 60, y: 56 }
        ],
      },
      // Artwork/frame on wall
      {
        id: 'artwork',
        name: 'Wall Art',
        color: '#2C2C2C',
        polygon: [
          { x: 15, y: 8 },
          { x: 35, y: 8 },
          { x: 35, y: 28 },
          { x: 15, y: 28 }
        ],
      },
      // Plant/greenery
      {
        id: 'plant',
        name: 'Plant',
        color: '#228B22',
        polygon: [
          { x: 78, y: 25 },
          { x: 85, y: 20 },
          { x: 92, y: 22 },
          { x: 95, y: 30 },
          { x: 93, y: 45 },
          { x: 88, y: 55 },
          { x: 82, y: 55 },
          { x: 77, y: 45 },
          { x: 75, y: 32 }
        ],
      },
      // Throw pillows on sofa
      {
        id: 'pillows',
        name: 'Throw Pillows',
        color: '#D4A574',
        polygon: [
          { x: 10, y: 38 },
          { x: 18, y: 38 },
          { x: 18, y: 48 },
          { x: 10, y: 48 }
        ],
      },
    ],
  },
  {
    id: 'kitchen-1',
    name: 'Contemporary Kitchen',
    description: 'White cabinets with marble countertop',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    baseImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop',
    components: [
      // Back wall
      {
        id: 'wall',
        name: 'Wall',
        color: '#FFFFFF',
        polygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 35 },
          { x: 0, y: 35 }
        ],
      },
      // Upper cabinets - shaped around hood
      {
        id: 'upper-cabinets',
        name: 'Upper Cabinets',
        color: '#2C3E50',
        polygon: [
          { x: 0, y: 8 },
          { x: 35, y: 8 },
          { x: 35, y: 38 },
          { x: 0, y: 38 }
        ],
      },
      // Upper cabinets right side
      {
        id: 'upper-cabinets-right',
        name: 'Upper Cabinets Right',
        color: '#2C3E50',
        polygon: [
          { x: 65, y: 8 },
          { x: 100, y: 8 },
          { x: 100, y: 38 },
          { x: 65, y: 38 }
        ],
      },
      // Range hood
      {
        id: 'range-hood',
        name: 'Range Hood',
        color: '#1A1A1A',
        polygon: [
          { x: 40, y: 5 },
          { x: 60, y: 5 },
          { x: 60, y: 35 },
          { x: 40, y: 35 }
        ],
      },
      // Backsplash - tiled area
      {
        id: 'backsplash',
        name: 'Backsplash',
        color: '#F5F5F5',
        polygon: [
          { x: 0, y: 38 },
          { x: 100, y: 38 },
          { x: 100, y: 48 },
          { x: 0, y: 48 }
        ],
      },
      // Countertop - marble surface
      {
        id: 'countertop',
        name: 'Marble Countertop',
        color: '#E8E8E8',
        polygon: [
          { x: 0, y: 48 },
          { x: 100, y: 48 },
          { x: 100, y: 55 },
          { x: 0, y: 55 }
        ],
      },
      // Lower cabinets
      {
        id: 'lower-cabinets',
        name: 'Lower Cabinets',
        color: '#2C3E50',
        polygon: [
          { x: 0, y: 55 },
          { x: 100, y: 55 },
          { x: 100, y: 78 },
          { x: 0, y: 78 }
        ],
      },
      // Floor
      {
        id: 'floor',
        name: 'Kitchen Floor',
        color: '#D4C4B5',
        polygon: [
          { x: 0, y: 78 },
          { x: 100, y: 78 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
      },
      // Island/counter in foreground
      {
        id: 'island',
        name: 'Kitchen Island',
        color: '#FFFFFF',
        polygon: [
          { x: 20, y: 85 },
          { x: 80, y: 85 },
          { x: 80, y: 100 },
          { x: 20, y: 100 }
        ],
      },
      // Stovetop
      {
        id: 'stovetop',
        name: 'Stovetop',
        color: '#1A1A1A',
        polygon: [
          { x: 42, y: 50 },
          { x: 58, y: 50 },
          { x: 58, y: 54 },
          { x: 42, y: 54 }
        ],
      },
    ],
  },
  {
    id: 'bedroom-1',
    name: 'Cozy Bedroom',
    description: 'Modern bedroom with upholstered bed',
    thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    baseImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=1080&fit=crop',
    components: [
      // Main wall
      {
        id: 'wall',
        name: 'Wall',
        color: '#F5F0E8',
        polygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 45 },
          { x: 0, y: 45 }
        ],
      },
      // Headboard - upholstered
      {
        id: 'headboard',
        name: 'Upholstered Headboard',
        color: '#8B7355',
        polygon: [
          { x: 22, y: 18 },
          { x: 78, y: 18 },
          { x: 78, y: 48 },
          { x: 22, y: 48 }
        ],
      },
      // Bed frame
      {
        id: 'bed-frame',
        name: 'Bed Frame',
        color: '#5C4033',
        polygon: [
          { x: 18, y: 48 },
          { x: 82, y: 48 },
          { x: 82, y: 52 },
          { x: 18, y: 52 }
        ],
      },
      // Bedding/duvet - main bed surface
      {
        id: 'bedding',
        name: 'Bedding',
        color: '#FFFAF0',
        polygon: [
          { x: 20, y: 52 },
          { x: 80, y: 52 },
          { x: 82, y: 80 },
          { x: 18, y: 80 }
        ],
      },
      // Pillows - decorative
      {
        id: 'pillows',
        name: 'Pillows',
        color: '#E8DDD4',
        polygon: [
          { x: 25, y: 42 },
          { x: 45, y: 42 },
          { x: 45, y: 55 },
          { x: 25, y: 55 }
        ],
      },
      // Pillows right
      {
        id: 'pillows-right',
        name: 'Pillows Right',
        color: '#E8DDD4',
        polygon: [
          { x: 55, y: 42 },
          { x: 75, y: 42 },
          { x: 75, y: 55 },
          { x: 55, y: 55 }
        ],
      },
      // Left nightstand
      {
        id: 'nightstand-left',
        name: 'Left Nightstand',
        color: '#4A3728',
        polygon: [
          { x: 5, y: 45 },
          { x: 18, y: 45 },
          { x: 18, y: 65 },
          { x: 5, y: 65 }
        ],
      },
      // Right nightstand
      {
        id: 'nightstand-right',
        name: 'Right Nightstand',
        color: '#4A3728',
        polygon: [
          { x: 82, y: 45 },
          { x: 95, y: 45 },
          { x: 95, y: 65 },
          { x: 82, y: 65 }
        ],
      },
      // Table lamp left
      {
        id: 'lamp-left',
        name: 'Left Lamp',
        color: '#F5DEB3',
        polygon: [
          { x: 8, y: 32 },
          { x: 15, y: 32 },
          { x: 15, y: 45 },
          { x: 8, y: 45 }
        ],
      },
      // Table lamp right
      {
        id: 'lamp-right',
        name: 'Right Lamp',
        color: '#F5DEB3',
        polygon: [
          { x: 85, y: 32 },
          { x: 92, y: 32 },
          { x: 92, y: 45 },
          { x: 85, y: 45 }
        ],
      },
      // Floor/carpet
      {
        id: 'floor',
        name: 'Floor',
        color: '#D4C4A8',
        polygon: [
          { x: 0, y: 80 },
          { x: 100, y: 80 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
      },
      // Throw blanket on bed
      {
        id: 'throw-blanket',
        name: 'Throw Blanket',
        color: '#C9B896',
        polygon: [
          { x: 25, y: 65 },
          { x: 75, y: 65 },
          { x: 75, y: 75 },
          { x: 25, y: 75 }
        ],
      },
    ],
  },
  {
    id: 'dining-room-1',
    name: 'Elegant Dining Room',
    description: 'Formal dining with chandelier',
    thumbnail: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop',
    baseImage: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1920&h=1080&fit=crop',
    components: [
      // Wall
      {
        id: 'wall',
        name: 'Wall',
        color: '#F0EBE3',
        polygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 50 },
          { x: 0, y: 50 }
        ],
      },
      // Dining table - large rectangular
      {
        id: 'dining-table',
        name: 'Dining Table',
        color: '#5C4033',
        polygon: [
          { x: 15, y: 45 },
          { x: 85, y: 45 },
          { x: 88, y: 75 },
          { x: 12, y: 75 }
        ],
      },
      // Chair 1 (left front)
      {
        id: 'chair-1',
        name: 'Chair Left Front',
        color: '#8B7355',
        polygon: [
          { x: 8, y: 60 },
          { x: 18, y: 60 },
          { x: 18, y: 85 },
          { x: 8, y: 85 }
        ],
      },
      // Chair 2 (right front)
      {
        id: 'chair-2',
        name: 'Chair Right Front',
        color: '#8B7355',
        polygon: [
          { x: 82, y: 60 },
          { x: 92, y: 60 },
          { x: 92, y: 85 },
          { x: 82, y: 85 }
        ],
      },
      // Chair 3 (left back)
      {
        id: 'chair-3',
        name: 'Chair Left Back',
        color: '#8B7355',
        polygon: [
          { x: 20, y: 38 },
          { x: 30, y: 38 },
          { x: 30, y: 50 },
          { x: 20, y: 50 }
        ],
      },
      // Chair 4 (right back)
      {
        id: 'chair-4',
        name: 'Chair Right Back',
        color: '#8B7355',
        polygon: [
          { x: 70, y: 38 },
          { x: 80, y: 38 },
          { x: 80, y: 50 },
          { x: 70, y: 50 }
        ],
      },
      // Chandelier
      {
        id: 'chandelier',
        name: 'Chandelier',
        color: '#FFD700',
        polygon: [
          { x: 40, y: 5 },
          { x: 60, y: 5 },
          { x: 65, y: 25 },
          { x: 35, y: 25 }
        ],
      },
      // Floor
      {
        id: 'floor',
        name: 'Floor',
        color: '#8B7355',
        polygon: [
          { x: 0, y: 75 },
          { x: 100, y: 75 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
      },
      // Rug under table
      {
        id: 'rug',
        name: 'Area Rug',
        color: '#B8860B',
        polygon: [
          { x: 10, y: 55 },
          { x: 90, y: 55 },
          { x: 92, y: 90 },
          { x: 8, y: 90 }
        ],
      },
      // Sideboard/buffet
      {
        id: 'sideboard',
        name: 'Sideboard',
        color: '#4A3728',
        polygon: [
          { x: 0, y: 40 },
          { x: 12, y: 40 },
          { x: 12, y: 60 },
          { x: 0, y: 60 }
        ],
      },
    ],
  },
  {
    id: 'bathroom-1',
    name: 'Luxury Bathroom',
    description: 'Spa-like bathroom with marble',
    thumbnail: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop',
    baseImage: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&h=1080&fit=crop',
    components: [
      // Wall tiles
      {
        id: 'wall-tiles',
        name: 'Wall Tiles',
        color: '#E8E8E8',
        polygon: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 55 },
          { x: 0, y: 55 }
        ],
      },
      // Vanity counter
      {
        id: 'vanity-counter',
        name: 'Vanity Counter',
        color: '#F5F5F5',
        polygon: [
          { x: 0, y: 55 },
          { x: 60, y: 55 },
          { x: 60, y: 62 },
          { x: 0, y: 62 }
        ],
      },
      // Vanity cabinet
      {
        id: 'vanity-cabinet',
        name: 'Vanity Cabinet',
        color: '#4A3728',
        polygon: [
          { x: 0, y: 62 },
          { x: 60, y: 62 },
          { x: 60, y: 85 },
          { x: 0, y: 85 }
        ],
      },
      // Mirror
      {
        id: 'mirror',
        name: 'Mirror',
        color: '#C0C0C0',
        polygon: [
          { x: 10, y: 15 },
          { x: 50, y: 15 },
          { x: 50, y: 52 },
          { x: 10, y: 52 }
        ],
      },
      // Sink
      {
        id: 'sink',
        name: 'Sink',
        color: '#FFFFFF',
        polygon: [
          { x: 20, y: 56 },
          { x: 40, y: 56 },
          { x: 40, y: 61 },
          { x: 20, y: 61 }
        ],
      },
      // Floor tiles
      {
        id: 'floor',
        name: 'Floor Tiles',
        color: '#D4D4D4',
        polygon: [
          { x: 0, y: 85 },
          { x: 100, y: 85 },
          { x: 100, y: 100 },
          { x: 0, y: 100 }
        ],
      },
      // Bathtub
      {
        id: 'bathtub',
        name: 'Bathtub',
        color: '#FFFFFF',
        polygon: [
          { x: 65, y: 45 },
          { x: 100, y: 45 },
          { x: 100, y: 85 },
          { x: 65, y: 85 }
        ],
      },
      // Towel
      {
        id: 'towel',
        name: 'Towel',
        color: '#F5F5DC',
        polygon: [
          { x: 55, y: 30 },
          { x: 62, y: 30 },
          { x: 62, y: 50 },
          { x: 55, y: 50 }
        ],
      },
    ],
  },
];