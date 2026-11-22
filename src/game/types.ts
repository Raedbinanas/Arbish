export type StationId =
  | 'counter'
  | 'grill'
  | 'fryer'
  | 'prep'
  | 'drinks'
  | 'storefront'
  | 'loft'
  | 'storage';

export type MenuItemId =
  | 'classic-burger'
  | 'double-burger'
  | 'truffle-smash'
  | 'crispy-chicken-burger'
  | 'chicken-bites'
  | 'loaded-fries'
  | 'brisket-fries'
  | 'nashville-fries'
  | 'arbish-fries'
  | 'jalapeno-bites'
  | 'cheesy-bites'
  | 'mozzarella-sticks'
  | 'onion-rings'
  | 'cheese-sauce'
  | 'spicy-sauce'
  | 'classic-sauce'
  | 'maple-sauce'
  | 'cherry-sauce'
  | 'bites-combo'
  | 'spicy-chicken-meal'
  | 'double-smash-meal';

export type IngredientId =
  | 'bottom-bun'
  | 'cooked-patty'
  | 'cheese'
  | 'lettuce'
  | 'tomato'
  | 'jalapeno'
  | 'mozzarella'
  | 'sauce'
  | 'classic-sauce'
  | 'cheese-sauce'
  | 'spicy-sauce'
  | 'maple-sauce'
  | 'cherry-sauce'
  | 'top-bun'
  | 'fries'
  | 'chicken-box'
  | 'sides-box'
  | 'soda';

export type HandItemType =
  | 'raw-patty'
  | 'cooked-patty'
  | 'burnt-patty'
  | 'raw-bun'
  | 'toasted-bun'
  | 'fries-basket-raw'
  | 'fries-cup'
  | 'chicken-box'
  | 'sides-box'
  | 'empty-cup'
  | 'soda-cup'
  | `tray-${MenuItemId}`;

export interface MenuDefinition {
  id: MenuItemId;
  name: string;
  shortName: string;
  price: number;
  prepTimeTarget: number;
  steps: string[];
}

export const ARBISH_MENU: Record<MenuItemId, MenuDefinition> = {
  'classic-burger': {
    id: 'classic-burger',
    name: 'Arbish Classic',
    shortName: 'Arbish Classic',
    price: 23,
    prepTimeTarget: 42,
    steps: ['Toasted Bun', 'Seared Patty', 'Cheese + Lettuce', 'Top Bun'],
  },
  'double-burger': {
    id: 'double-burger',
    name: 'Double Smash',
    shortName: 'Double Smash',
    price: 23,
    prepTimeTarget: 50,
    steps: ['Toasted Bun', '2x Seared Patty', 'Double Cheese + Tomato', 'Top Bun'],
  },
  'truffle-smash': {
    id: 'truffle-smash',
    name: 'Supreme Maple Smash',
    shortName: 'Supreme Smash',
    price: 24,
    prepTimeTarget: 48,
    steps: ['Toasted Bun', 'Seared Patty', 'Cheese + Signature Sauce', 'Top Bun'],
  },
  'crispy-chicken-burger': {
    id: 'crispy-chicken-burger',
    name: 'Nashville Strips',
    shortName: 'Nashville Strips',
    price: 25,
    prepTimeTarget: 42,
    steps: ['Chicken Strips', 'Spicy / Classic Sauce'],
  },
  'chicken-bites': {
    id: 'chicken-bites',
    name: 'Chicken Strips',
    shortName: 'Chicken Strips',
    price: 23,
    prepTimeTarget: 35,
    steps: ['Fry Strips Basket', 'Serve Chicken Strips'],
  },
  'brisket-fries': {
    id: 'brisket-fries',
    name: 'Brisket Fries',
    shortName: 'Brisket Fries',
    price: 21,
    prepTimeTarget: 46,
    steps: ['Fries', 'Seared Patty', 'Cheese + Pomegranate Sauce'],
  },
  'nashville-fries': {
    id: 'nashville-fries',
    name: 'Nashville Fries',
    shortName: 'Nashville Fries',
    price: 20,
    prepTimeTarget: 42,
    steps: ['Fries', 'Chicken Strips', 'Spicy / Signature Sauce'],
  },
  'arbish-fries': {
    id: 'arbish-fries',
    name: 'Arbish Fries',
    shortName: 'Arbish Fries',
    price: 19,
    prepTimeTarget: 44,
    steps: ['Fries', 'Chicken Strips', 'Cheese + Jalapeño'],
  },
  'loaded-fries': {
    id: 'loaded-fries',
    name: 'Fries',
    shortName: 'Fries',
    price: 6,
    prepTimeTarget: 28,
    steps: ['Fry Potato Basket', 'Spiced Crispy Fries'],
  },
  'jalapeno-bites': {
    id: 'jalapeno-bites',
    name: 'Jalapeño Bites',
    shortName: 'Jalapeño Bites',
    price: 12,
    prepTimeTarget: 36,
    steps: ['Fry Sides Basket', '+ Jalapeño (4 pcs)'],
  },
  'cheesy-bites': {
    id: 'cheesy-bites',
    name: 'Cheesy Bites',
    shortName: 'Cheesy Bites',
    price: 10,
    prepTimeTarget: 34,
    steps: ['Fry Sides Basket', '+ Cheese (4 pcs)'],
  },
  'mozzarella-sticks': {
    id: 'mozzarella-sticks',
    name: 'Mozzarella Sticks',
    shortName: 'Mozzarella Sticks',
    price: 9,
    prepTimeTarget: 34,
    steps: ['Fry Sides Basket', '+ Mozzarella (4 pcs)'],
  },
  'onion-rings': {
    id: 'onion-rings',
    name: 'Onion Rings',
    shortName: 'Onion Rings',
    price: 9,
    prepTimeTarget: 32,
    steps: ['Fry Sides Basket', 'Serve Onion Rings (6 pcs)'],
  },
  'cheese-sauce': {
    id: 'cheese-sauce',
    name: 'Cheese Sauce',
    shortName: 'Cheese Sauce',
    price: 2,
    prepTimeTarget: 18,
    steps: ['Cheese Sauce Cup', 'Plate Tray'],
  },
  'spicy-sauce': {
    id: 'spicy-sauce',
    name: 'Spicy Sauce',
    shortName: 'Spicy Sauce',
    price: 2,
    prepTimeTarget: 18,
    steps: ['Spicy Sauce Cup', 'Plate Tray'],
  },
  'classic-sauce': {
    id: 'classic-sauce',
    name: 'Classic Sauce',
    shortName: 'Classic Sauce',
    price: 2,
    prepTimeTarget: 18,
    steps: ['Classic Sauce Cup', 'Plate Tray'],
  },
  'maple-sauce': {
    id: 'maple-sauce',
    name: 'Maple Sauce',
    shortName: 'Maple Sauce',
    price: 2,
    prepTimeTarget: 18,
    steps: ['Maple Sauce Cup', 'Plate Tray'],
  },
  'cherry-sauce': {
    id: 'cherry-sauce',
    name: 'Cherry Sauce',
    shortName: 'Cherry Sauce',
    price: 2,
    prepTimeTarget: 18,
    steps: ['Cherry Sauce Cup', 'Plate Tray'],
  },
  'bites-combo': {
    id: 'bites-combo',
    name: 'Arbish Classic Meal',
    shortName: 'Classic Meal',
    price: 30,
    prepTimeTarget: 62,
    steps: ['Arbish Classic', 'Fries', 'Soft Drink'],
  },
  'spicy-chicken-meal': {
    id: 'spicy-chicken-meal',
    name: 'Chicken Strips Meal',
    shortName: 'Strips Meal',
    price: 30,
    prepTimeTarget: 56,
    steps: ['Chicken Strips', 'Fries', 'Soft Drink'],
  },
  'double-smash-meal': {
    id: 'double-smash-meal',
    name: 'Double Smash Meal',
    shortName: 'Double Meal',
    price: 30,
    prepTimeTarget: 68,
    steps: ['Double Smash', 'Fries', 'Soft Drink'],
  },
};

export interface OrderTicket {
  id: number;
  customerId: string;
  customerName: string;
  itemId: MenuItemId;
  taken: boolean;
  source: 'walk-in' | 'online';
  platform?: 'HungerStation' | 'Jahez' | 'Arbish App';
  neighborhood?: string;
  driverName?: string;
  payout?: number;
  patience: number;
  maxPatience: number;
  createdAt: number;
}

export interface GrillSlotSnapshot {
  index: number;
  state: 'empty' | 'raw' | 'seared' | 'ready' | 'burnt';
  progress: number;
}

export interface FryerSlotSnapshot {
  index: number;
  kind: 'fries' | 'chicken' | 'sides';
  state: 'idle' | 'frying' | 'ready' | 'burnt';
  progress: number;
}

export interface AssemblySnapshot {
  layers: IngredientId[];
  matchedItem: MenuItemId | null;
}

export interface DrinkSlotSnapshot {
  state: 'empty' | 'filling' | 'ready';
  flavor: 'Cola' | 'Citrus' | 'Berry';
  progress: number;
}

export interface GameHudSnapshot {
  phase: 'title' | 'playing' | 'shift-end' | 'game-complete';
  shiftNumber: number;
  shiftClockLabel: string;
  shiftTimeLeft: number;
  money: number;
  tips: number;
  ordersServed: number;
  ordersMissed: number;
  streak: number;
  bestStreak: number;
  rating: number;
  tutorialMode: boolean;
  tutorialStep: number;
  tutorialTitle: string | null;
  tutorialHint: string | null;
  heldItem: HandItemType | null;
  heldLabel: string;
  hoverPrompt: string | null;
  hoverSubPrompt: string | null;
  activeStation: StationId | null;
  isPointerLocked: boolean;
  freeMouseLook: boolean;
  freeCam: boolean;
  cameraFov: number;
  tickets: OrderTicket[];
  onlineOrdersEnabled: boolean;
  onlineDispatched: number;
  grillSlots: GrillSlotSnapshot[];
  fryerSlots: FryerSlotSnapshot[];
  assembly: AssemblySnapshot;
  drinkSlot: DrinkSlotSnapshot;
  toastMessage: string | null;
}

export const HAND_ITEM_LABELS: Record<HandItemType, string> = {
  'raw-patty': 'Raw Beef Patty',
  'cooked-patty': 'Seared Beef Patty',
  'burnt-patty': 'Charred Patty (Trash)',
  'raw-bun': 'Soft Burger Bun',
  'toasted-bun': 'Toasted Burger Bun',
  'fries-basket-raw': 'Raw Fries',
  'fries-cup': 'Spiced Fries',
  'chicken-box': 'Crispy Chicken Strips',
  'sides-box': 'Crispy Side Bites',
  'empty-cup': 'Empty Arbish Cup',
  'soda-cup': 'Chilled Soft Drink',
  'tray-classic-burger': 'Tray: Arbish Classic',
  'tray-double-burger': 'Tray: Double Smash',
  'tray-truffle-smash': 'Tray: Supreme Maple Smash',
  'tray-crispy-chicken-burger': 'Tray: Nashville Strips',
  'tray-chicken-bites': 'Tray: Chicken Strips',
  'tray-brisket-fries': 'Tray: Brisket Fries',
  'tray-nashville-fries': 'Tray: Nashville Fries',
  'tray-arbish-fries': 'Tray: Arbish Fries',
  'tray-loaded-fries': 'Tray: Spiced Fries',
  'tray-jalapeno-bites': 'Tray: Jalapeño Bites',
  'tray-cheesy-bites': 'Tray: Cheesy Bites',
  'tray-mozzarella-sticks': 'Tray: Mozzarella Sticks',
  'tray-onion-rings': 'Tray: Onion Rings',
  'tray-cheese-sauce': 'Tray: Cheese Sauce',
  'tray-spicy-sauce': 'Tray: Spicy Sauce',
  'tray-classic-sauce': 'Tray: Classic Sauce',
  'tray-maple-sauce': 'Tray: Maple Sauce',
  'tray-cherry-sauce': 'Tray: Cherry Sauce',
  'tray-bites-combo': 'Tray: Arbish Classic Meal',
  'tray-spicy-chicken-meal': 'Tray: Chicken Strips Meal',
  'tray-double-smash-meal': 'Tray: Double Smash Meal',
};
