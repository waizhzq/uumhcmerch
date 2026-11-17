// ===== EDIT HERE — brand, ordering and products =====
import logo from "../images/logo.webp";
import qr from "../images/qr.png";
import poloFront from "../images/polo-front.webp";
import poloBack from "../images/polo-back.webp";
import turqFront from "../images/turquoise-front.webp";
import turqBack from "../images/turquoise-back.webp";
import purpFront from "../images/purple-front.webp";
import purpBack from "../images/purple-back.webp";

export const CONFIG = {
  brand: "UUM Handball Team",
  logo,
  qr,
  currency: "RM",
  orderUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSck0-ZUD-r7XPFyxJiuvg9NA9yaCiHwHcUxmsvEWEG8bRDnKQ/viewform?usp=publish-editor",
  loadingMs: 7000,
};

// group: items in the same group show as hang tags you can switch between
export const PRODUCTS = [
  { id: "turquoise", name: "Turquoise Training Kit", kind: "Training kit", price: 35, group: "training",
    tag: "Turquoise", tagColor: "#3f8c9e", tagText: "#e9c96a", front: turqFront, back: turqBack },
  { id: "polo", name: "Polo Collar Jersey", kind: "Northern Panthers jersey", price: 39, group: "polo",
    tag: "Jersey", tagColor: "#1f2a3a", tagText: "#4f8be0", front: poloFront, back: poloBack },
  { id: "purple", name: "Purple Training Kit", kind: "Training kit", price: 35, group: "training",
    tag: "Purple", tagColor: "#37305e", tagText: "#e57bb2", front: purpFront, back: purpBack },
];

export const START = 1; // which item is out front when the page opens
export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
