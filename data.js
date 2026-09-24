// Raw transaction data from NYC Restaurant Co. - Jan to Mar 2026
// Source: NYC Restaurant Co. - Raw Transactions.xlsx
const RAW_TRANSACTIONS = [
  {
    "Transaction ID": "T1051",
    "Date": "2026-01-01",
    "Description": "Rent",
    "Counterparty": "Landlord",
    "Amount": -9000.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1031",
    "Date": "2026-01-03",
    "Description": "Food inventory purchase - Sysco",
    "Counterparty": "Sysco",
    "Amount": -4151.25,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1052",
    "Date": "2026-01-04",
    "Description": "POS/software subscription",
    "Counterparty": "Toast",
    "Amount": -875.0,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1053",
    "Date": "2026-01-05",
    "Description": "Insurance premium",
    "Counterparty": "Next Insurance",
    "Amount": -1250.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1032",
    "Date": "2026-01-06",
    "Description": "Food inventory purchase - US Foods",
    "Counterparty": "US Foods",
    "Amount": -4814.71,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1041",
    "Date": "2026-01-07",
    "Description": "Beverage inventory purchase - Southern Glazer's",
    "Counterparty": "Southern Glazer's",
    "Amount": -1779.21,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1054",
    "Date": "2026-01-07",
    "Description": "Accounting/bookkeeping",
    "Counterparty": "LedgerPro Bookkeeping",
    "Amount": -650.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1001",
    "Date": "2026-01-08",
    "Description": "POS batch deposit - food sales week 1",
    "Counterparty": "Toast POS",
    "Amount": 17513.84,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1002",
    "Date": "2026-01-08",
    "Description": "POS batch deposit - beverage sales week 1",
    "Counterparty": "Toast POS",
    "Amount": 5163.62,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1003",
    "Date": "2026-01-08",
    "Description": "Catering invoice payment week 1",
    "Counterparty": "Corporate Catering Client",
    "Amount": 750.84,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1044",
    "Date": "2026-01-08",
    "Description": "To-go packaging and disposables",
    "Counterparty": "Restaurant Depot",
    "Amount": -1043.52,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1004",
    "Date": "2026-01-09",
    "Description": "Delivery marketplace payout week 1",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 4671.96,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1005",
    "Date": "2026-01-09",
    "Description": "Refunds and discounts week 1",
    "Counterparty": "Toast POS",
    "Amount": -571.3,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1055",
    "Date": "2026-01-09",
    "Description": "Internet and phone",
    "Counterparty": "Comcast Business",
    "Amount": -420.0,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1006",
    "Date": "2026-01-10",
    "Description": "Delivery platform commission week 1",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1217.52,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1033",
    "Date": "2026-01-10",
    "Description": "Food inventory purchase - Local Produce Co.",
    "Counterparty": "Local Produce Co.",
    "Amount": -2376.81,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1061",
    "Date": "2026-01-10",
    "Description": "Equipment purchase - new oven",
    "Counterparty": "Restaurant Equipment World",
    "Amount": -7800.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1056",
    "Date": "2026-01-12",
    "Description": "Utilities - electric/gas/water",
    "Counterparty": "City Utilities",
    "Amount": -2031.72,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1034",
    "Date": "2026-01-13",
    "Description": "Food inventory purchase - Butcher & Sons",
    "Counterparty": "Butcher & Sons",
    "Amount": -4422.96,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1007",
    "Date": "2026-01-15",
    "Description": "POS batch deposit - food sales week 2",
    "Counterparty": "Toast POS",
    "Amount": 18283.62,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1008",
    "Date": "2026-01-15",
    "Description": "POS batch deposit - beverage sales week 2",
    "Counterparty": "Toast POS",
    "Amount": 5250.24,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1009",
    "Date": "2026-01-15",
    "Description": "Catering invoice payment week 2",
    "Counterparty": "Corporate Catering Client",
    "Amount": 1987.27,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1042",
    "Date": "2026-01-15",
    "Description": "Beverage inventory purchase - Craft Beer Distributor",
    "Counterparty": "Craft Beer Distributor",
    "Amount": -1858.49,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1046",
    "Date": "2026-01-15",
    "Description": "Payroll - hourly kitchen and FOH wages",
    "Counterparty": "Gusto Payroll",
    "Amount": -16360.64,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1010",
    "Date": "2026-01-16",
    "Description": "Delivery marketplace payout week 2",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 4435.61,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1011",
    "Date": "2026-01-16",
    "Description": "Refunds and discounts week 2",
    "Counterparty": "Toast POS",
    "Amount": -400.93,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1035",
    "Date": "2026-01-16",
    "Description": "Food inventory purchase - Bakery Supply",
    "Counterparty": "Bakery Supply",
    "Amount": -3735.86,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1047",
    "Date": "2026-01-16",
    "Description": "Payroll taxes and benefits",
    "Counterparty": "Gusto Payroll",
    "Amount": -1892.64,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1057",
    "Date": "2026-01-16",
    "Description": "Cleaning and linen service",
    "Counterparty": "LinenPro",
    "Amount": -1193.59,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1012",
    "Date": "2026-01-17",
    "Description": "Delivery platform commission week 2",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1110.33,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1036",
    "Date": "2026-01-18",
    "Description": "Food inventory purchase - Sysco",
    "Counterparty": "Sysco",
    "Amount": -2286.92,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1058",
    "Date": "2026-01-18",
    "Description": "Marketing - local ads",
    "Counterparty": "Meta/Google/Yelp",
    "Amount": -2121.28,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1062",
    "Date": "2026-01-20",
    "Description": "Sales tax remittance",
    "Counterparty": "Florida Dept. of Revenue",
    "Amount": -6150.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1037",
    "Date": "2026-01-21",
    "Description": "Food inventory purchase - US Foods",
    "Counterparty": "US Foods",
    "Amount": -4269.38,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1013",
    "Date": "2026-01-22",
    "Description": "POS batch deposit - food sales week 3",
    "Counterparty": "Toast POS",
    "Amount": 15647.22,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1014",
    "Date": "2026-01-22",
    "Description": "POS batch deposit - beverage sales week 3",
    "Counterparty": "Toast POS",
    "Amount": 5406.76,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1015",
    "Date": "2026-01-22",
    "Description": "Catering invoice payment week 3",
    "Counterparty": "Corporate Catering Client",
    "Amount": 909.4,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1045",
    "Date": "2026-01-22",
    "Description": "To-go packaging and disposables",
    "Counterparty": "Restaurant Depot",
    "Amount": -698.27,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1059",
    "Date": "2026-01-22",
    "Description": "Repairs and maintenance",
    "Counterparty": "Kitchen Repair Co.",
    "Amount": -1256.72,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1016",
    "Date": "2026-01-23",
    "Description": "Delivery marketplace payout week 3",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 5065.12,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1017",
    "Date": "2026-01-23",
    "Description": "Refunds and discounts week 3",
    "Counterparty": "Toast POS",
    "Amount": -401.52,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1043",
    "Date": "2026-01-23",
    "Description": "Beverage inventory purchase - Beverage Depot",
    "Counterparty": "Beverage Depot",
    "Amount": -2691.48,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1018",
    "Date": "2026-01-24",
    "Description": "Delivery platform commission week 3",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1293.41,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1038",
    "Date": "2026-01-24",
    "Description": "Food inventory purchase - Local Produce Co.",
    "Counterparty": "Local Produce Co.",
    "Amount": -4493.6,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1060",
    "Date": "2026-01-25",
    "Description": "Office/admin supplies",
    "Counterparty": "Staples/Amazon",
    "Amount": -335.8,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1039",
    "Date": "2026-01-27",
    "Description": "Food inventory purchase - Butcher & Sons",
    "Counterparty": "Butcher & Sons",
    "Amount": -3198.22,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1048",
    "Date": "2026-01-28",
    "Description": "Payroll - hourly kitchen and FOH wages",
    "Counterparty": "Gusto Payroll",
    "Amount": -15260.37,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1050",
    "Date": "2026-01-28",
    "Description": "Manager salary payroll",
    "Counterparty": "Gusto Payroll",
    "Amount": -6500.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1019",
    "Date": "2026-01-29",
    "Description": "POS batch deposit - food sales week 4",
    "Counterparty": "Toast POS",
    "Amount": 18031.6,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1020",
    "Date": "2026-01-29",
    "Description": "POS batch deposit - beverage sales week 4",
    "Counterparty": "Toast POS",
    "Amount": 5137.73,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1021",
    "Date": "2026-01-29",
    "Description": "Catering invoice payment week 4",
    "Counterparty": "Corporate Catering Client",
    "Amount": 2384.22,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1049",
    "Date": "2026-01-29",
    "Description": "Payroll taxes and benefits",
    "Counterparty": "Gusto Payroll",
    "Amount": -1743.42,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1022",
    "Date": "2026-01-30",
    "Description": "Delivery marketplace payout week 4",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 5252.33,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1023",
    "Date": "2026-01-30",
    "Description": "Refunds and discounts week 4",
    "Counterparty": "Toast POS",
    "Amount": -440.94,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1024",
    "Date": "2026-01-31",
    "Description": "Delivery platform commission week 4",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1204.51,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1025",
    "Date": "2026-01-31",
    "Description": "POS batch deposit - food sales week 5",
    "Counterparty": "Toast POS",
    "Amount": 7920.72,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1026",
    "Date": "2026-01-31",
    "Description": "POS batch deposit - beverage sales week 5",
    "Counterparty": "Toast POS",
    "Amount": 2399.76,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1027",
    "Date": "2026-01-31",
    "Description": "Catering invoice payment week 5",
    "Counterparty": "Corporate Catering Client",
    "Amount": 673.73,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1028",
    "Date": "2026-01-31",
    "Description": "Delivery marketplace payout week 5",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 1936.02,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1029",
    "Date": "2026-01-31",
    "Description": "Refunds and discounts week 5",
    "Counterparty": "Toast POS",
    "Amount": -607.83,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1030",
    "Date": "2026-01-31",
    "Description": "Delivery platform commission week 5",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -496.05,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1040",
    "Date": "2026-01-31",
    "Description": "Food inventory purchase - Bakery Supply",
    "Counterparty": "Bakery Supply",
    "Amount": -3894.88,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1107",
    "Date": "2026-02-01",
    "Description": "Rent",
    "Counterparty": "Landlord",
    "Amount": -9000.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1087",
    "Date": "2026-02-03",
    "Description": "Food inventory purchase - Sysco",
    "Counterparty": "Sysco",
    "Amount": -4797.2,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1108",
    "Date": "2026-02-04",
    "Description": "POS/software subscription",
    "Counterparty": "Toast",
    "Amount": -875.0,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1109",
    "Date": "2026-02-05",
    "Description": "Insurance premium",
    "Counterparty": "Next Insurance",
    "Amount": -1250.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1088",
    "Date": "2026-02-06",
    "Description": "Food inventory purchase - US Foods",
    "Counterparty": "US Foods",
    "Amount": -4119.59,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1097",
    "Date": "2026-02-06",
    "Description": "Beverage inventory purchase - Southern Glazer's",
    "Counterparty": "Southern Glazer's",
    "Amount": -3316.87,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1110",
    "Date": "2026-02-07",
    "Description": "Accounting/bookkeeping",
    "Counterparty": "LedgerPro Bookkeeping",
    "Amount": -650.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1063",
    "Date": "2026-02-08",
    "Description": "POS batch deposit - food sales week 1",
    "Counterparty": "Toast POS",
    "Amount": 19049.34,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1064",
    "Date": "2026-02-08",
    "Description": "POS batch deposit - beverage sales week 1",
    "Counterparty": "Toast POS",
    "Amount": 5539.24,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1065",
    "Date": "2026-02-08",
    "Description": "Catering invoice payment week 1",
    "Counterparty": "Corporate Catering Client",
    "Amount": 1044.81,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1100",
    "Date": "2026-02-08",
    "Description": "To-go packaging and disposables",
    "Counterparty": "Restaurant Depot",
    "Amount": -1004.61,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1066",
    "Date": "2026-02-09",
    "Description": "Delivery marketplace payout week 1",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 5726.56,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1067",
    "Date": "2026-02-09",
    "Description": "Refunds and discounts week 1",
    "Counterparty": "Toast POS",
    "Amount": -490.41,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1111",
    "Date": "2026-02-09",
    "Description": "Internet and phone",
    "Counterparty": "Comcast Business",
    "Amount": -420.0,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1068",
    "Date": "2026-02-10",
    "Description": "Delivery platform commission week 1",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1282.59,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1089",
    "Date": "2026-02-10",
    "Description": "Food inventory purchase - Local Produce Co.",
    "Counterparty": "Local Produce Co.",
    "Amount": -4029.59,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1117",
    "Date": "2026-02-11",
    "Description": "Gift card sales deposit",
    "Counterparty": "Toast POS",
    "Amount": 2400.0,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1112",
    "Date": "2026-02-12",
    "Description": "Utilities - electric/gas/water",
    "Counterparty": "City Utilities",
    "Amount": -2086.3,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1090",
    "Date": "2026-02-13",
    "Description": "Food inventory purchase - Butcher & Sons",
    "Counterparty": "Butcher & Sons",
    "Amount": -3406.7,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1069",
    "Date": "2026-02-15",
    "Description": "POS batch deposit - food sales week 2",
    "Counterparty": "Toast POS",
    "Amount": 19518.56,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1070",
    "Date": "2026-02-15",
    "Description": "POS batch deposit - beverage sales week 2",
    "Counterparty": "Toast POS",
    "Amount": 6299.96,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1071",
    "Date": "2026-02-15",
    "Description": "Catering invoice payment week 2",
    "Counterparty": "Corporate Catering Client",
    "Amount": 2439.71,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1102",
    "Date": "2026-02-15",
    "Description": "Payroll - hourly kitchen and FOH wages",
    "Counterparty": "Gusto Payroll",
    "Amount": -17375.9,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1072",
    "Date": "2026-02-16",
    "Description": "Delivery marketplace payout week 2",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 4956.41,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1073",
    "Date": "2026-02-16",
    "Description": "Refunds and discounts week 2",
    "Counterparty": "Toast POS",
    "Amount": -524.73,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1091",
    "Date": "2026-02-16",
    "Description": "Food inventory purchase - Bakery Supply",
    "Counterparty": "Bakery Supply",
    "Amount": -3834.43,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1098",
    "Date": "2026-02-16",
    "Description": "Beverage inventory purchase - Craft Beer Distributor",
    "Counterparty": "Craft Beer Distributor",
    "Amount": -2074.1,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1103",
    "Date": "2026-02-16",
    "Description": "Payroll taxes and benefits",
    "Counterparty": "Gusto Payroll",
    "Amount": -2116.96,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1113",
    "Date": "2026-02-16",
    "Description": "Cleaning and linen service",
    "Counterparty": "LinenPro",
    "Amount": -1025.54,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1074",
    "Date": "2026-02-17",
    "Description": "Delivery platform commission week 2",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1353.5,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1092",
    "Date": "2026-02-18",
    "Description": "Food inventory purchase - Sysco",
    "Counterparty": "Sysco",
    "Amount": -4272.82,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1114",
    "Date": "2026-02-18",
    "Description": "Marketing - local ads",
    "Counterparty": "Meta/Google/Yelp",
    "Amount": -2383.96,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1093",
    "Date": "2026-02-21",
    "Description": "Food inventory purchase - US Foods",
    "Counterparty": "US Foods",
    "Amount": -4276.96,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1118",
    "Date": "2026-02-21",
    "Description": "Loan principal repayment",
    "Counterparty": "Bank Loan",
    "Amount": -3500.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1075",
    "Date": "2026-02-22",
    "Description": "POS batch deposit - food sales week 3",
    "Counterparty": "Toast POS",
    "Amount": 18642.84,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1076",
    "Date": "2026-02-22",
    "Description": "POS batch deposit - beverage sales week 3",
    "Counterparty": "Toast POS",
    "Amount": 5668.59,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1077",
    "Date": "2026-02-22",
    "Description": "Catering invoice payment week 3",
    "Counterparty": "Corporate Catering Client",
    "Amount": 737.83,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1101",
    "Date": "2026-02-22",
    "Description": "To-go packaging and disposables",
    "Counterparty": "Restaurant Depot",
    "Amount": -763.85,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1115",
    "Date": "2026-02-22",
    "Description": "Repairs and maintenance",
    "Counterparty": "Kitchen Repair Co.",
    "Amount": -2142.27,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1078",
    "Date": "2026-02-23",
    "Description": "Delivery marketplace payout week 3",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 5648.49,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1079",
    "Date": "2026-02-23",
    "Description": "Refunds and discounts week 3",
    "Counterparty": "Toast POS",
    "Amount": -538.64,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1080",
    "Date": "2026-02-24",
    "Description": "Delivery platform commission week 3",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1495.84,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1099",
    "Date": "2026-02-24",
    "Description": "Beverage inventory purchase - Beverage Depot",
    "Counterparty": "Beverage Depot",
    "Amount": -2971.53,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1094",
    "Date": "2026-02-25",
    "Description": "Food inventory purchase - Local Produce Co.",
    "Counterparty": "Local Produce Co.",
    "Amount": -4528.94,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1116",
    "Date": "2026-02-25",
    "Description": "Office/admin supplies",
    "Counterparty": "Staples/Amazon",
    "Amount": -502.18,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1081",
    "Date": "2026-02-28",
    "Description": "POS batch deposit - food sales week 4",
    "Counterparty": "Toast POS",
    "Amount": 17948.13,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1082",
    "Date": "2026-02-28",
    "Description": "POS batch deposit - beverage sales week 4",
    "Counterparty": "Toast POS",
    "Amount": 6324.3,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1083",
    "Date": "2026-02-28",
    "Description": "Catering invoice payment week 4",
    "Counterparty": "Corporate Catering Client",
    "Amount": 2048.2,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1084",
    "Date": "2026-02-28",
    "Description": "Delivery marketplace payout week 4",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 5976.52,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1085",
    "Date": "2026-02-28",
    "Description": "Refunds and discounts week 4",
    "Counterparty": "Toast POS",
    "Amount": -398.42,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1086",
    "Date": "2026-02-28",
    "Description": "Delivery platform commission week 4",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1491.81,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1095",
    "Date": "2026-02-28",
    "Description": "Food inventory purchase - Butcher & Sons",
    "Counterparty": "Butcher & Sons",
    "Amount": -2623.5,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1096",
    "Date": "2026-02-28",
    "Description": "Food inventory purchase - Bakery Supply",
    "Counterparty": "Bakery Supply",
    "Amount": -2758.66,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1104",
    "Date": "2026-02-28",
    "Description": "Payroll - hourly kitchen and FOH wages",
    "Counterparty": "Gusto Payroll",
    "Amount": -17022.99,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1105",
    "Date": "2026-02-28",
    "Description": "Payroll taxes and benefits",
    "Counterparty": "Gusto Payroll",
    "Amount": -1855.14,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1106",
    "Date": "2026-02-28",
    "Description": "Manager salary payroll",
    "Counterparty": "Gusto Payroll",
    "Amount": -6500.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1169",
    "Date": "2026-03-01",
    "Description": "Rent",
    "Counterparty": "Landlord",
    "Amount": -9000.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1149",
    "Date": "2026-03-03",
    "Description": "Food inventory purchase - Sysco",
    "Counterparty": "Sysco",
    "Amount": -3246.78,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1170",
    "Date": "2026-03-04",
    "Description": "POS/software subscription",
    "Counterparty": "Toast",
    "Amount": -875.0,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1171",
    "Date": "2026-03-05",
    "Description": "Insurance premium",
    "Counterparty": "Next Insurance",
    "Amount": -1250.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1179",
    "Date": "2026-03-06",
    "Description": "Large catering event food purchase",
    "Counterparty": "Sysco",
    "Amount": -6200.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1150",
    "Date": "2026-03-07",
    "Description": "Food inventory purchase - US Foods",
    "Counterparty": "US Foods",
    "Amount": -2597.1,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1159",
    "Date": "2026-03-07",
    "Description": "Beverage inventory purchase - Southern Glazer's",
    "Counterparty": "Southern Glazer's",
    "Amount": -3358.84,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1172",
    "Date": "2026-03-07",
    "Description": "Accounting/bookkeeping",
    "Counterparty": "LedgerPro Bookkeeping",
    "Amount": -650.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1119",
    "Date": "2026-03-08",
    "Description": "POS batch deposit - food sales week 1",
    "Counterparty": "Toast POS",
    "Amount": 20350.64,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1120",
    "Date": "2026-03-08",
    "Description": "POS batch deposit - beverage sales week 1",
    "Counterparty": "Toast POS",
    "Amount": 6801.35,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1121",
    "Date": "2026-03-08",
    "Description": "Catering invoice payment week 1",
    "Counterparty": "Corporate Catering Client",
    "Amount": 797.87,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1162",
    "Date": "2026-03-08",
    "Description": "To-go packaging and disposables",
    "Counterparty": "Restaurant Depot",
    "Amount": -1049.56,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1122",
    "Date": "2026-03-09",
    "Description": "Delivery marketplace payout week 1",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 5667.06,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1123",
    "Date": "2026-03-09",
    "Description": "Refunds and discounts week 1",
    "Counterparty": "Toast POS",
    "Amount": -764.35,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1151",
    "Date": "2026-03-09",
    "Description": "Food inventory purchase - Local Produce Co.",
    "Counterparty": "Local Produce Co.",
    "Amount": -4407.12,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1173",
    "Date": "2026-03-09",
    "Description": "Internet and phone",
    "Counterparty": "Comcast Business",
    "Amount": -420.0,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1124",
    "Date": "2026-03-10",
    "Description": "Delivery platform commission week 1",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1521.08,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1152",
    "Date": "2026-03-12",
    "Description": "Food inventory purchase - Butcher & Sons",
    "Counterparty": "Butcher & Sons",
    "Amount": -2756.47,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1174",
    "Date": "2026-03-12",
    "Description": "Utilities - electric/gas/water",
    "Counterparty": "City Utilities",
    "Amount": -2101.38,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1160",
    "Date": "2026-03-14",
    "Description": "Beverage inventory purchase - Craft Beer Distributor",
    "Counterparty": "Craft Beer Distributor",
    "Amount": -1946.77,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1125",
    "Date": "2026-03-15",
    "Description": "POS batch deposit - food sales week 2",
    "Counterparty": "Toast POS",
    "Amount": 19069.41,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1126",
    "Date": "2026-03-15",
    "Description": "POS batch deposit - beverage sales week 2",
    "Counterparty": "Toast POS",
    "Amount": 6395.86,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1127",
    "Date": "2026-03-15",
    "Description": "Catering invoice payment week 2",
    "Counterparty": "Corporate Catering Client",
    "Amount": 2501.5,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1153",
    "Date": "2026-03-15",
    "Description": "Food inventory purchase - Bakery Supply",
    "Counterparty": "Bakery Supply",
    "Amount": -3260.32,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1164",
    "Date": "2026-03-15",
    "Description": "Payroll - hourly kitchen and FOH wages",
    "Counterparty": "Gusto Payroll",
    "Amount": -19455.95,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1128",
    "Date": "2026-03-16",
    "Description": "Delivery marketplace payout week 2",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 5260.62,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1129",
    "Date": "2026-03-16",
    "Description": "Refunds and discounts week 2",
    "Counterparty": "Toast POS",
    "Amount": -666.78,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1165",
    "Date": "2026-03-16",
    "Description": "Payroll taxes and benefits",
    "Counterparty": "Gusto Payroll",
    "Amount": -2304.89,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1175",
    "Date": "2026-03-16",
    "Description": "Cleaning and linen service",
    "Counterparty": "LinenPro",
    "Amount": -1064.65,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1130",
    "Date": "2026-03-17",
    "Description": "Delivery platform commission week 2",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1414.9,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1154",
    "Date": "2026-03-18",
    "Description": "Food inventory purchase - Sysco",
    "Counterparty": "Sysco",
    "Amount": -5272.24,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1176",
    "Date": "2026-03-18",
    "Description": "Marketing - local ads",
    "Counterparty": "Meta/Google/Yelp",
    "Amount": -2293.06,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1180",
    "Date": "2026-03-19",
    "Description": "Owner distribution",
    "Counterparty": "Owner",
    "Amount": -5000.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1155",
    "Date": "2026-03-21",
    "Description": "Food inventory purchase - US Foods",
    "Counterparty": "US Foods",
    "Amount": -4170.16,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1131",
    "Date": "2026-03-22",
    "Description": "POS batch deposit - food sales week 3",
    "Counterparty": "Toast POS",
    "Amount": 21701.54,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1132",
    "Date": "2026-03-22",
    "Description": "POS batch deposit - beverage sales week 3",
    "Counterparty": "Toast POS",
    "Amount": 6873.53,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1133",
    "Date": "2026-03-22",
    "Description": "Catering invoice payment week 3",
    "Counterparty": "Corporate Catering Client",
    "Amount": 804.75,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1163",
    "Date": "2026-03-22",
    "Description": "To-go packaging and disposables",
    "Counterparty": "Restaurant Depot",
    "Amount": -1078.24,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1177",
    "Date": "2026-03-22",
    "Description": "Repairs and maintenance",
    "Counterparty": "Kitchen Repair Co.",
    "Amount": -1293.31,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1134",
    "Date": "2026-03-23",
    "Description": "Delivery marketplace payout week 3",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 6091.44,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1135",
    "Date": "2026-03-23",
    "Description": "Refunds and discounts week 3",
    "Counterparty": "Toast POS",
    "Amount": -749.54,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1136",
    "Date": "2026-03-24",
    "Description": "Delivery platform commission week 3",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1400.47,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1161",
    "Date": "2026-03-24",
    "Description": "Beverage inventory purchase - Beverage Depot",
    "Counterparty": "Beverage Depot",
    "Amount": -2613.48,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1181",
    "Date": "2026-03-24",
    "Description": "Annual license renewal",
    "Counterparty": "City Business Licensing",
    "Amount": -900.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1156",
    "Date": "2026-03-25",
    "Description": "Food inventory purchase - Local Produce Co.",
    "Counterparty": "Local Produce Co.",
    "Amount": -4664.04,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1178",
    "Date": "2026-03-25",
    "Description": "Office/admin supplies",
    "Counterparty": "Staples/Amazon",
    "Amount": -298.26,
    "Method": "Card"
  },
  {
    "Transaction ID": "T1157",
    "Date": "2026-03-27",
    "Description": "Food inventory purchase - Butcher & Sons",
    "Counterparty": "Butcher & Sons",
    "Amount": -4250.16,
    "Method": "ACH/card"
  },
  {
    "Transaction ID": "T1166",
    "Date": "2026-03-28",
    "Description": "Payroll - hourly kitchen and FOH wages",
    "Counterparty": "Gusto Payroll",
    "Amount": -20297.75,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1168",
    "Date": "2026-03-28",
    "Description": "Manager salary payroll",
    "Counterparty": "Gusto Payroll",
    "Amount": -6500.0,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1137",
    "Date": "2026-03-29",
    "Description": "POS batch deposit - food sales week 4",
    "Counterparty": "Toast POS",
    "Amount": 20096.63,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1138",
    "Date": "2026-03-29",
    "Description": "POS batch deposit - beverage sales week 4",
    "Counterparty": "Toast POS",
    "Amount": 6994.47,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1139",
    "Date": "2026-03-29",
    "Description": "Catering invoice payment week 4",
    "Counterparty": "Corporate Catering Client",
    "Amount": 2981.88,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1167",
    "Date": "2026-03-29",
    "Description": "Payroll taxes and benefits",
    "Counterparty": "Gusto Payroll",
    "Amount": -2171.22,
    "Method": "ACH"
  },
  {
    "Transaction ID": "T1140",
    "Date": "2026-03-30",
    "Description": "Delivery marketplace payout week 4",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 6476.35,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1141",
    "Date": "2026-03-30",
    "Description": "Refunds and discounts week 4",
    "Counterparty": "Toast POS",
    "Amount": -675.78,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1142",
    "Date": "2026-03-31",
    "Description": "Delivery platform commission week 4",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -1692.87,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1143",
    "Date": "2026-03-31",
    "Description": "POS batch deposit - food sales week 5",
    "Counterparty": "Toast POS",
    "Amount": 8895.84,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1144",
    "Date": "2026-03-31",
    "Description": "POS batch deposit - beverage sales week 5",
    "Counterparty": "Toast POS",
    "Amount": 2852.0,
    "Method": "Bank deposit"
  },
  {
    "Transaction ID": "T1145",
    "Date": "2026-03-31",
    "Description": "Catering invoice payment week 5",
    "Counterparty": "Corporate Catering Client",
    "Amount": 1074.99,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1146",
    "Date": "2026-03-31",
    "Description": "Delivery marketplace payout week 5",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": 2435.14,
    "Method": "ACH deposit"
  },
  {
    "Transaction ID": "T1147",
    "Date": "2026-03-31",
    "Description": "Refunds and discounts week 5",
    "Counterparty": "Toast POS",
    "Amount": -731.35,
    "Method": "POS adjustment"
  },
  {
    "Transaction ID": "T1148",
    "Date": "2026-03-31",
    "Description": "Delivery platform commission week 5",
    "Counterparty": "DoorDash/Uber Eats",
    "Amount": -601.7,
    "Method": "Marketplace deduction"
  },
  {
    "Transaction ID": "T1158",
    "Date": "2026-03-31",
    "Description": "Food inventory purchase - Bakery Supply",
    "Counterparty": "Bakery Supply",
    "Amount": -3305.16,
    "Method": "ACH/card"
  }
];
