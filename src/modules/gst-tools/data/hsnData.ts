export interface HSNEntry {
  code: string
  description: string
  gstRate: number // percentage: 0, 5, 12, 18, 28
  cessRate?: number // percentage, optional
  chapter: string
  unit?: string
}

export const HSN_DATA: HSNEntry[] = [
  // Chapter 61 - Apparel (knitted)
  { code: '6101', description: "Men's overcoats, car-coats, capes, cloaks, anoraks, windbreakers", gstRate: 12, chapter: '61' },
  { code: '6102', description: "Women's overcoats, car-coats, capes, cloaks, anoraks, windbreakers", gstRate: 12, chapter: '61' },
  { code: '6103', description: "Men's or boys' suits, ensembles, jackets, blazers of knitted fabric", gstRate: 12, chapter: '61' },
  { code: '6104', description: "Women's or girls' suits, ensembles, jackets, blazers of knitted fabric", gstRate: 12, chapter: '61' },
  { code: '6105', description: "Men's or boys' shirts of knitted or crocheted fabric", gstRate: 5, chapter: '61' },
  { code: '6106', description: "Women's or girls' blouses, shirts of knitted or crocheted fabric", gstRate: 5, chapter: '61' },
  { code: '6109', description: 'T-shirts, singlets and other vests', gstRate: 5, chapter: '61' },
  { code: '6110', description: 'Jerseys, pullovers, sweatshirts, waistcoats and similar articles of knitted or crocheted fabrics', gstRate: 12, chapter: '61' },
  { code: '6111', description: "Babies' garments and clothing accessories of knitted or crocheted fabric", gstRate: 5, chapter: '61' },
  { code: '6116', description: 'Gloves, mittens and mitts of knitted or crocheted fabric', gstRate: 12, chapter: '61' },

  // Chapter 62 - Apparel (woven)
  { code: '6201', description: "Men's or boys' overcoats, car-coats, capes, cloaks, woven", gstRate: 12, chapter: '62' },
  { code: '6203', description: "Men's or boys' suits, ensembles, jackets, blazers, trousers, woven", gstRate: 12, chapter: '62' },
  { code: '6204', description: "Women's or girls' suits, ensembles, jackets, blazers, dresses, woven", gstRate: 12, chapter: '62' },
  { code: '6207', description: "Men's or boys' singlets, underpants, briefs, nightwear, woven", gstRate: 5, chapter: '62' },
  { code: '6208', description: "Women's or girls' singlets, slips, panties, nightwear, woven", gstRate: 5, chapter: '62' },
  { code: '6209', description: "Babies' garments and clothing accessories, woven", gstRate: 5, chapter: '62' },
  { code: '6211', description: 'Track suits, ski-suits, swimwear, woven', gstRate: 12, chapter: '62' },
  { code: '6217', description: 'Other clothing accessories; parts of garments or clothing accessories', gstRate: 12, chapter: '62' },

  // Chapter 64 - Footwear
  { code: '6401', description: 'Waterproof footwear with soles and uppers of rubber or plastics', gstRate: 18, chapter: '64' },
  { code: '6402', description: 'Other footwear with outer soles and uppers of rubber or plastics', gstRate: 18, chapter: '64' },
  { code: '6403', description: 'Footwear with outer soles of rubber, plastics, leather or composition leather and uppers of leather', gstRate: 18, chapter: '64' },
  { code: '6404', description: 'Footwear with outer soles of rubber, plastics, leather; uppers of textile materials', gstRate: 18, chapter: '64' },
  { code: '6405', description: 'Other footwear', gstRate: 18, chapter: '64' },

  // Chapter 85 - Electronics
  { code: '8517', description: 'Telephone sets, smartphones, mobile phones', gstRate: 18, chapter: '85' },
  { code: '8471', description: 'Automatic data processing machines, computers and laptops', gstRate: 18, chapter: '85' },
  { code: '8518', description: 'Microphones, loudspeakers, headphones, earphones', gstRate: 18, chapter: '85' },
  { code: '8519', description: 'Sound recording or reproducing apparatus, MP3 players', gstRate: 18, chapter: '85' },
  { code: '8521', description: 'Video recording or reproducing apparatus, whether or not incorporating a video tuner', gstRate: 18, chapter: '85' },
  { code: '8523', description: 'Discs, tapes, solid-state storage devices, smart cards, USB drives', gstRate: 18, chapter: '85' },
  { code: '8525', description: 'Transmission apparatus for radio-broadcasting or television, cameras', gstRate: 18, chapter: '85' },
  { code: '8528', description: 'Television receivers, monitors, projectors', gstRate: 28, cessRate: 0, chapter: '85' },
  { code: '8543', description: 'Electrical machines and apparatus, having individual functions, LED lights, inverters', gstRate: 18, chapter: '85' },

  // Chapter 84 - Machinery
  { code: '8415', description: 'Air conditioning machines, comprising a motor-driven fan', gstRate: 28, cessRate: 0, chapter: '84' },
  { code: '8418', description: 'Refrigerators, freezers and other refrigerating or freezing equipment', gstRate: 18, chapter: '84' },
  { code: '8450', description: 'Household or laundry-type washing machines, including dry-cleaning machines', gstRate: 18, chapter: '84' },
  { code: '8516', description: 'Electric water heaters, immersion heaters, hair dryers, electric irons, microwaves, OTGs', gstRate: 18, chapter: '84' },

  // Chapter 33 - Beauty & Personal Care
  { code: '3301', description: 'Essential oils whether or not terpeneless', gstRate: 18, chapter: '33' },
  { code: '3303', description: 'Perfumes and toilet waters', gstRate: 28, chapter: '33' },
  { code: '3304', description: 'Beauty or make-up preparations and preparations for the care of the skin', gstRate: 18, chapter: '33' },
  { code: '3305', description: 'Preparations for use on the hair, shampoos, hair conditioners, hair colours', gstRate: 18, chapter: '33' },
  { code: '3306', description: 'Preparations for oral or dental hygiene, toothpaste, mouthwash', gstRate: 18, chapter: '33' },
  { code: '3307', description: 'Pre-shave, shaving or after-shave preparations, deodorants, bath salts', gstRate: 18, chapter: '33' },

  // Chapter 34 - Soaps & Detergents
  { code: '3401', description: 'Soap; organic surface-active products for washing the skin', gstRate: 18, chapter: '34' },
  { code: '3402', description: 'Organic surface-active agents; washing preparations, detergents', gstRate: 18, chapter: '34' },

  // Chapter 94 - Furniture & Home
  { code: '9401', description: 'Seats including those convertible into beds', gstRate: 18, chapter: '94' },
  { code: '9403', description: 'Other furniture and parts thereof', gstRate: 18, chapter: '94' },
  { code: '9404', description: 'Mattress supports; articles of bedding and similar furnishing; lamps and lighting fittings', gstRate: 18, chapter: '94' },
  { code: '9405', description: 'Lamps and lighting fittings, illuminated signs, name-plates and the like', gstRate: 12, chapter: '94' },

  // Chapter 95 - Toys & Sports
  { code: '9503', description: 'Tricycles, scooters, toy vehicles, dolls, toys, puzzles', gstRate: 18, chapter: '95' },
  { code: '9504', description: 'Video game consoles and machines, playing cards, board games', gstRate: 28, cessRate: 0, chapter: '95' },
  { code: '9506', description: 'Articles and equipment for sports, gymnastics, athletics, outdoor games', gstRate: 12, chapter: '95' },
  { code: '9507', description: 'Fishing rods, fish-hooks, fishing lines, reels and other fishing tackle', gstRate: 12, chapter: '95' },

  // Chapter 39 - Plastics
  { code: '3923', description: 'Articles for the conveyance or packing of goods of plastics', gstRate: 18, chapter: '39' },
  { code: '3924', description: 'Tableware, kitchenware, household articles of plastics', gstRate: 18, chapter: '39' },
  { code: '3926', description: 'Other articles of plastics and articles of other materials of headings 3901 to 3914', gstRate: 18, chapter: '39' },

  // Chapter 48 - Paper Products
  { code: '4819', description: 'Cartons, boxes, cases, bags and other packing containers of paper', gstRate: 12, chapter: '48' },
  { code: '4820', description: 'Registers, account books, notebooks, order books, receipt books of paper', gstRate: 12, chapter: '48' },
  { code: '4821', description: 'Paper or paperboard labels of all kinds, whether or not printed', gstRate: 12, chapter: '48' },

  // Chapter 49 - Books & Education
  { code: '4901', description: 'Printed books, brochures, leaflets and similar printed matter', gstRate: 0, chapter: '49' },
  { code: '4902', description: 'Newspapers, journals and periodicals', gstRate: 0, chapter: '49' },
  { code: '4903', description: "Children's picture, drawing or colouring books", gstRate: 0, chapter: '49' },
  { code: '4905', description: 'Maps and hydrographic or similar charts, printed', gstRate: 12, chapter: '49' },
  { code: '4907', description: 'Unused postage, revenue or similar stamps; banknotes', gstRate: 0, chapter: '49' },

  // Chapter 30 - Pharmaceuticals
  { code: '3001', description: 'Glands and other organs for organo-therapeutic uses, dried; extracts of glands', gstRate: 12, chapter: '30' },
  { code: '3002', description: 'Human blood; animal blood; antisera, vaccines, toxins, cultures of micro-organisms', gstRate: 5, chapter: '30' },
  { code: '3003', description: 'Medicaments consisting of two or more constituents mixed together for therapeutic or prophylactic uses (not in measured doses)', gstRate: 12, chapter: '30' },
  { code: '3004', description: 'Medicaments in measured doses (including those in the form of patches) for retail sale', gstRate: 12, chapter: '30' },
  { code: '3005', description: 'Wadding, gauze, bandages, antiseptic plasters and similar articles, medical use', gstRate: 12, chapter: '30' },
  { code: '3006', description: 'Pharmaceutical goods — surgical gloves, medical instruments, contraceptives', gstRate: 12, chapter: '30' },

  // Chapter 21 - Food Preparations
  { code: '2101', description: 'Extracts, essences and concentrates of coffee, tea or mate', gstRate: 18, chapter: '21' },
  { code: '2103', description: 'Sauces and preparations therefor; mixed condiments, ketchup, mustard', gstRate: 12, chapter: '21' },
  { code: '2104', description: 'Soups and broths and preparations therefor; homogenised composite food preparations', gstRate: 18, chapter: '21' },
  { code: '2105', description: 'Ice cream and other edible ice, whether or not containing cocoa', gstRate: 18, chapter: '21' },
  { code: '2106', description: 'Food preparations not elsewhere specified or included, protein concentrates, flavouring powders', gstRate: 18, chapter: '21' },

  // Chapter 19 - Processed Cereals / Bakery
  { code: '1901', description: 'Malt extract; food preparations for infants, baby food', gstRate: 5, chapter: '19' },
  { code: '1902', description: 'Pasta, whether or not cooked, noodles, spaghetti, macaroni', gstRate: 12, chapter: '19' },
  { code: '1903', description: 'Tapioca and substitutes therefor prepared from starch, in the form of flakes, grains', gstRate: 12, chapter: '19' },
  { code: '1905', description: 'Bread, pastry, cakes, biscuits, waffles, rusks', gstRate: 18, chapter: '19' },

  // Chapter 04 - Dairy
  { code: '0401', description: 'Milk and cream, not concentrated nor containing added sugar', gstRate: 0, chapter: '04' },
  { code: '0402', description: 'Milk and cream, concentrated or containing added sugar or other sweetening matter', gstRate: 5, chapter: '04' },
  { code: '0404', description: 'Whey, whether or not concentrated; products consisting of natural milk constituents', gstRate: 5, chapter: '04' },
  { code: '0406', description: 'Cheese and curd', gstRate: 12, chapter: '04' },
  { code: '0407', description: 'Birds\' eggs, in shell, fresh, preserved or cooked', gstRate: 0, chapter: '04' },

  // Chapter 07 - Vegetables
  { code: '0701', description: 'Potatoes, fresh or chilled', gstRate: 0, chapter: '07' },
  { code: '0702', description: 'Tomatoes, fresh or chilled', gstRate: 0, chapter: '07' },
  { code: '0703', description: 'Onions, shallots, garlic, leeks and other alliaceous vegetables', gstRate: 0, chapter: '07' },
  { code: '0706', description: 'Carrots, turnips, salad beetroot, radishes and similar edible roots', gstRate: 0, chapter: '07' },
  { code: '0714', description: 'Manioc, arrowroot, salep, Jerusalem artichokes, sweet potatoes', gstRate: 0, chapter: '07' },

  // Chapter 08 - Fruits
  { code: '0801', description: 'Coconuts, Brazil nuts and cashew nuts, fresh or dried', gstRate: 5, chapter: '08' },
  { code: '0802', description: 'Other nuts — almonds, hazelnuts, walnuts, pistachios, dried fruit', gstRate: 5, chapter: '08' },
  { code: '0803', description: 'Bananas, including plantains, fresh or dried', gstRate: 0, chapter: '08' },
  { code: '0804', description: 'Dates, figs, pineapples, avocados, guavas, mangoes, mangosteens', gstRate: 12, chapter: '08' },
  { code: '0805', description: 'Citrus fruit — oranges, mandarins, lemons, limes, grapefruit', gstRate: 0, chapter: '08' },

  // Chapter 18 - Cocoa / Chocolate
  { code: '1801', description: 'Cocoa beans, whole or broken, raw or roasted', gstRate: 5, chapter: '18' },
  { code: '1805', description: 'Cocoa powder, not containing added sugar or other sweetening matter', gstRate: 5, chapter: '18' },
  { code: '1806', description: 'Chocolate and other food preparations containing cocoa', gstRate: 18, chapter: '18' },

  // Chapter 63 - Home Textiles
  { code: '6301', description: 'Blankets and travelling rugs', gstRate: 5, chapter: '63' },
  { code: '6302', description: 'Bed linen, table linen, toilet linen and kitchen linen', gstRate: 5, chapter: '63' },
  { code: '6304', description: 'Other furnishing articles, bed spreads, cushion covers, curtains', gstRate: 5, chapter: '63' },
  { code: '6305', description: 'Sacks and bags, of a kind used for the packing of goods', gstRate: 12, chapter: '63' },

  // Chapter 42 - Leather goods / Bags
  { code: '4202', description: 'Trunks, suit-cases, vanity-cases, handbags, wallets, briefcases, backpacks, travel bags', gstRate: 18, chapter: '42' },
  { code: '4203', description: 'Articles of apparel and clothing accessories, of leather', gstRate: 18, chapter: '42' },
  { code: '4205', description: 'Other articles of leather or of composition leather', gstRate: 18, chapter: '42' },

  // Chapter 82 - Tools / Hardware
  { code: '8201', description: 'Hand tools: spades, shovels, hoes, forks, rakes, picks, mattocks', gstRate: 18, chapter: '82' },
  { code: '8202', description: 'Hand saws; blades for saws of all kinds', gstRate: 18, chapter: '82' },
  { code: '8203', description: 'Files, rasps, pliers, pincers, tweezers, wire cutters, pipe cutters, bolt cutters', gstRate: 18, chapter: '82' },
  { code: '8204', description: 'Hand-operated spanners and wrenches; socket wrenches', gstRate: 18, chapter: '82' },
  { code: '8205', description: 'Hand tools — hammers, screwdrivers, chisels, drills, punches', gstRate: 18, chapter: '82' },
  { code: '8211', description: 'Knives, blades for cutting household use, kitchen knives', gstRate: 18, chapter: '82' },

  // Chapter 96 - Miscellaneous manufactured articles
  { code: '9601', description: 'Worked ivory, bone, tortoise-shell, horn, antlers, coral; articles thereof', gstRate: 12, chapter: '96' },
  { code: '9603', description: 'Brooms, brushes, mop heads, paint pads and rollers, squeegees', gstRate: 12, chapter: '96' },
  { code: '9605', description: 'Travel sets for personal toilet, sewing or shoe or clothes cleaning', gstRate: 18, chapter: '96' },
  { code: '9608', description: 'Ball point pens; felt tipped and other porous-tipped pens and markers; fountain pens, stylographs', gstRate: 12, chapter: '96' },
  { code: '9615', description: 'Combs, hair-slides, hair pins and similar articles; hairpins, curling pins', gstRate: 18, chapter: '96' },

  // Chapter 73 - Articles of Iron or Steel
  { code: '7321', description: 'Stoves, ranges, grills, cookers, barbecues, gas rings and similar non-electric domestic appliances', gstRate: 18, chapter: '73' },
  { code: '7323', description: 'Table, kitchen or other household articles of iron or steel; steel wool', gstRate: 18, chapter: '73' },
  { code: '7324', description: 'Sanitary ware and parts thereof, of iron or steel', gstRate: 18, chapter: '73' },

  // Chapter 76 - Aluminium articles
  { code: '7615', description: 'Table, kitchen or other household articles of aluminium; aluminium pots, pans', gstRate: 18, chapter: '76' },

  // Chapter 90 - Medical / Optical instruments
  { code: '9001', description: 'Optical fibres and optical fibre bundles; optical fibre cables; sheets and plates of polarising material; lenses, prisms', gstRate: 12, chapter: '90' },
  { code: '9018', description: 'Instruments and appliances used in medical, surgical, dental or veterinary sciences', gstRate: 12, chapter: '90' },
  { code: '9021', description: 'Orthopaedic appliances; surgical belts, trusses, hearing aids, pacemakers', gstRate: 12, chapter: '90' },

  // Chapter 44 - Wood products
  { code: '4419', description: 'Tableware and kitchenware, of wood — chopping boards, wooden spoons', gstRate: 12, chapter: '44' },
  { code: '4420', description: 'Wood marquetry and inlaid wood; caskets; statuettes and other ornaments, of wood', gstRate: 12, chapter: '44' },

  // Chapter 69 - Ceramic articles
  { code: '6911', description: 'Tableware, kitchenware, other household articles of porcelain or china', gstRate: 12, chapter: '69' },
  { code: '6912', description: 'Ceramic tableware, kitchenware, other household articles', gstRate: 12, chapter: '69' },

  // Chapter 70 - Glass articles
  { code: '7013', description: 'Glassware of a kind used for table, kitchen, toilet, office or similar purposes', gstRate: 18, chapter: '70' },

  // Chapter 29 - Organic chemicals / supplements
  { code: '2936', description: 'Provitamins and vitamins, natural or reproduced by synthesis; derivatives; intermixtures', gstRate: 12, chapter: '29' },

  // Chapter 22 - Beverages
  { code: '2201', description: 'Waters, including natural or artificial mineral waters and aerated waters', gstRate: 18, chapter: '22' },
  { code: '2202', description: 'Waters including mineral waters and aerated waters, containing added sugar — soft drinks', gstRate: 28, cessRate: 12, chapter: '22' },
  { code: '2203', description: 'Beer made from malt', gstRate: 28, cessRate: 0, chapter: '22' },
  { code: '2204', description: 'Wine of fresh grapes, including fortified wines; grape must', gstRate: 0, chapter: '22' },

  // Chapter 27 - Fuels / Energy products
  { code: '2710', description: 'Petroleum oils and oils obtained from bituminous minerals (other than crude)', gstRate: 0, chapter: '27' },

  // Chapter 58 - Special woven fabrics
  { code: '5801', description: 'Woven pile fabrics and chenille fabrics, other than fabrics of heading 5802 or 5806', gstRate: 5, chapter: '58' },
  { code: '5806', description: 'Narrow woven fabrics (other than goods of heading 5807)', gstRate: 5, chapter: '58' },

  // Chapter 57 - Carpets & floor coverings
  { code: '5701', description: 'Carpets and other textile floor coverings, knotted', gstRate: 12, chapter: '57' },
  { code: '5703', description: 'Carpets and other textile floor coverings, tufted', gstRate: 12, chapter: '57' },
  { code: '5705', description: 'Other carpets and other textile floor coverings, whether or not made up', gstRate: 12, chapter: '57' },

  // Chapter 91 - Watches & clocks
  { code: '9101', description: 'Wrist-watches, pocket-watches and other watches, including stop-watches, with case of precious metal', gstRate: 28, cessRate: 0, chapter: '91' },
  { code: '9102', description: 'Wrist-watches, pocket-watches and other watches, including stop-watches, other than those of heading 9101', gstRate: 18, chapter: '91' },
  { code: '9105', description: 'Other clocks, alarm clocks, wall clocks', gstRate: 18, chapter: '91' },

  // Chapter 71 - Jewellery
  { code: '7113', description: "Articles of jewellery and parts thereof, of precious metal or of metal clad with precious metal", gstRate: 3, chapter: '71' },
  { code: '7117', description: 'Imitation jewellery', gstRate: 3, chapter: '71' },
]
