/**
 * Hero room-hotspot demo data — an illustrative example room (not the
 * visitor's own photo), so tapping a dot shows a made-up item and price
 * purely to demonstrate the idea. Same "illustrative, not live" convention
 * as the marquee testimonials and the hero's simulated redesign demo.
 */

export interface RoomItem {
  /** Position as a percentage of the image, matching the source photo's layout. */
  x: number;
  y: number;
  name: string;
  description: string;
  price: string;
}

export type StyleKey = 'Minimal' | 'Maximalism' | 'Scandinavian' | 'Japanese';

export interface DemoRoom {
  key: 'living' | 'bedroom' | 'kitchen' | 'hall';
  label: string;
  image: string;
  alt: string;
  items: RoomItem[];
  /** This room redesigned in each style — what the stage shows once a style tile is tapped. */
  styles: Record<StyleKey, { image: string; alt: string }>;
}

export const DEMO_ROOMS: DemoRoom[] = [
  {
    key: 'living',
    label: 'Living room',
    image: '/assets/rooms/hero.jpg',
    alt: 'Warm living room with a dark leather chaise sofa, oak wall cabinets, glass side tables and a floor lamp',
    styles: {
      Minimal: { image: '/assets/rooms/room-living-minimal.jpg', alt: 'Living room redesigned in a minimal style' },
      Maximalism: { image: '/assets/rooms/room-living-maximalism.jpg', alt: 'Living room redesigned in a maximalist style' },
      Scandinavian: { image: '/assets/rooms/room-living-scandinavian.jpg', alt: 'Living room redesigned in a Scandinavian style' },
      Japanese: { image: '/assets/rooms/room-living-japanese.jpg', alt: 'Living room redesigned in a Japanese style' },
    },
    items: [
      { x: 18.5, y: 15.7, name: 'Glass-front wall cabinets', description: 'Oak veneer, three doors with integrated lighting.', price: '£120' },
      { x: 31.7, y: 34.6, name: 'Linen table lamp', description: 'Brushed steel frame, off-white linen shade.', price: '£34' },
      { x: 9, y: 52, name: 'Oak sideboard', description: 'Low four-door unit in light oak veneer.', price: '£320' },
      { x: 61, y: 52, name: 'Leather chaise sofa', description: 'Three-seater with chaise, espresso-brown leather.', price: '£1,299' },
      { x: 39, y: 68, name: 'Two-tier coffee table', description: 'Round tempered-glass tops on a steel frame.', price: '£89' },
      { x: 57, y: 82, name: 'Leather footstool', description: 'Matches the sofa; storage under the lid.', price: '£249' },
      { x: 88, y: 63, name: 'Side table on castors', description: 'Glass shelves, rolls where you need it.', price: '£59' },
      { x: 93, y: 27, name: 'Floor lamp', description: 'Tall steel stand with a square linen shade.', price: '£75' },
      { x: 17, y: 85, name: 'High-pile shag rug', description: 'Oatmeal wool blend, 170 × 240 cm.', price: '£110' },
    ],
  },
  {
    key: 'bedroom',
    label: 'Bedroom',
    image: '/assets/rooms/room-bedroom.jpg',
    alt: 'Bedroom with a black wooden double bed, gallery wall, reading lamp and grey rug',
    styles: {
      Minimal: { image: '/assets/rooms/room-bedroom-minimal.jpg', alt: 'Bedroom redesigned in a minimal style' },
      Maximalism: { image: '/assets/rooms/room-bedroom-maximalism.jpg', alt: 'Bedroom redesigned in a maximalist style' },
      Scandinavian: { image: '/assets/rooms/room-bedroom-scandinavian.jpg', alt: 'Bedroom redesigned in a Scandinavian style' },
      Japanese: { image: '/assets/rooms/room-bedroom-japanese.jpg', alt: 'Bedroom redesigned in a Japanese style' },
    },
    items: [
      { x: 66, y: 63, name: 'Solid wood double bed', description: 'Black-brown stained pine, 160 × 200 cm.', price: '£449' },
      { x: 29, y: 61, name: 'Check duvet cover set', description: 'Cotton, beige-and-white check with two pillowcases.', price: '£55' },
      { x: 44, y: 29, name: 'Reading floor lamp', description: 'Adjustable arm, nickel-plated shade.', price: '£45' },
      { x: 16.6, y: 21, name: 'Gallery frame set', description: 'Five frames in black and antique gold.', price: '£60' },
      { x: 95.5, y: 55, name: 'Chest of drawers', description: 'Three drawers, black-brown, turned knobs.', price: '£199' },
      { x: 76, y: 90, name: 'Grey shag rug', description: 'Low-pile, 133 × 195 cm.', price: '£89' },
      { x: 13, y: 92, name: 'Sheepskin throw rug', description: 'Natural white, single pelt.', price: '£29' },
    ],
  },
  {
    key: 'kitchen',
    label: 'Kitchen',
    image: '/assets/rooms/room-kitchen.jpg',
    alt: 'Oak kitchen with built-in ovens, white pendant lamp and a dining table with black chairs',
    styles: {
      Minimal: { image: '/assets/rooms/room-kitchen-minimal.jpg', alt: 'Kitchen redesigned in a minimal style' },
      Maximalism: { image: '/assets/rooms/room-kitchen-maximalism.jpg', alt: 'Kitchen redesigned in a maximalist style' },
      Scandinavian: { image: '/assets/rooms/room-kitchen-scandinavian.jpg', alt: 'Kitchen redesigned in a Scandinavian style' },
      Japanese: { image: '/assets/rooms/room-kitchen-japanese.jpg', alt: 'Kitchen redesigned in a Japanese style' },
    },
    items: [
      { x: 32, y: 63, name: 'Oak kitchen units', description: 'Oak veneer doors, full-height and base units.', price: 'from £2,400' },
      { x: 5.6, y: 31, name: 'Built-in oven', description: 'Stainless steel, 71 L, fan assisted.', price: '£449' },
      { x: 42.5, y: 25.5, name: 'Wall clock', description: 'Black steel, 38 cm, silent sweep.', price: '£15' },
      { x: 83, y: 23.5, name: 'Sculptural pendant lamp', description: 'White layered shade, 50 cm.', price: '£69' },
      { x: 79, y: 70, name: 'Solid birch dining table', description: 'Seats six, 220 × 100 cm.', price: '£349' },
      { x: 57.5, y: 73, name: 'Black armchair', description: 'Steel frame, moulded seat.', price: '£65' },
      { x: 48, y: 91, name: 'Striped flatweave rug', description: 'Black and white cotton, 170 × 240 cm.', price: '£79' },
    ],
  },
  {
    key: 'hall',
    label: 'Hall',
    image: '/assets/rooms/room-hall.jpg',
    alt: 'Dark hallway with a white console table, arched mirror, gallery wall and roses',
    styles: {
      Minimal: { image: '/assets/rooms/room-hall-minimal.jpg', alt: 'Hall redesigned in a minimal style' },
      Maximalism: { image: '/assets/rooms/room-hall-maximalism.jpg', alt: 'Hall redesigned in a maximalist style' },
      Scandinavian: { image: '/assets/rooms/room-hall-scandinavian.jpg', alt: 'Hall redesigned in a Scandinavian style' },
      Japanese: { image: '/assets/rooms/room-hall-japanese.jpg', alt: 'Hall redesigned in a Japanese style' },
    },
    items: [
      { x: 51, y: 76, name: 'White console table', description: 'Two-tier, solid pine with shelf.', price: '£129' },
      { x: 50, y: 33, name: 'Arched mirror', description: 'White frame, 60 × 90 cm.', price: '£79' },
      { x: 29.3, y: 42, name: 'Pleated table lamp', description: 'Brass-tone stem, gathered fabric shade.', price: '£39' },
      { x: 21, y: 21, name: 'Coat stand', description: 'Black steel, six hooks.', price: '£35' },
      { x: 69, y: 6, name: 'Wall clock', description: 'Cream face, 40 cm.', price: '£25' },
      { x: 83.5, y: 73, name: 'Rattan chair', description: 'Hand-woven, black-stained.', price: '£85' },
      { x: 33, y: 91, name: 'Seagrass baskets', description: 'Set of two, with rope handles.', price: '£22' },
    ],
  },
];

export interface DemoStyle {
  key: StyleKey;
  label: string;
  image: string;
  alt: string;
}

export const DEMO_STYLES: DemoStyle[] = [
  { key: 'Minimal', label: 'Minimal', image: '/assets/rooms/s-minimal.jpg', alt: 'Minimal bedroom with oak drawers and a round mirror' },
  { key: 'Maximalism', label: 'Maximalism', image: '/assets/rooms/s-maximal.jpg', alt: 'Colourful maximalist living room with bright wall cabinets' },
  { key: 'Scandinavian', label: 'Scandinavian', image: '/assets/rooms/s-scandi.jpg', alt: 'Bright Scandinavian dining room with white chairs and plants' },
  { key: 'Japanese', label: 'Japanese', image: '/assets/rooms/s-japanese.jpg', alt: 'Calm Japanese-style corner with pale wood, linen curtain and daybed' },
];

