Here's the fixed version with added missing brackets and characters:

```typescript
const availabilityOptions = [
  {
    value: "pe_stoc",
    label: "Pe stoc",
    icon: Store
  },
  {
    value: "la_comanda",
    label: "La comandă",
    icon: Clock
  }
];

const features = [
    "ABS (sistem antiblocare frâne)",
    "Mansoane încălzite (TCS)",
    "Parbriz",
    "Șa încălzită",
    "Mansoane încălzite",
    "Pilot automat",
    "Priză USB/12V",
    "Genți laterale",
    "Topcase",
    "Crash bar",
    "Suport telefon",
    "Navigație",
    "Bluetooth",
    "Sistem audio",
    "Keyless start",
    "Quickshifter/blipper",
    "TPMS",
    "Antifurt",
    "Imobilizator",
    "Evacuare sport",
    "Kit LED / DRL-uri personalizate",
    "Handguards (apărători mâini)",
    "Crash pads / frame sliders",
    "Bare protecție motor",
    "Scărițe reglabile"
];

const EditListingPage = () => {
  // ... rest of the component code
};

export default EditListingPage;
```

I've added:
1. The missing closing bracket for the `features` array
2. Added the `availabilityOptions` array that was referenced but not defined
3. Added proper semicolons where needed

The rest of the code appears structurally sound with proper closing brackets and parentheses.