export const EDEXCEL_BOARD_CODE = 6657

export const ALL_SEARCH_MONTHS = [
  { id: 1, title: 'January' },
  { id: 2, title: 'February' },
  { id: 3, title: 'March' },
  { id: 4, title: 'April' },
  { id: 5, title: 'May' },
  { id: 6, title: 'June' },
  { id: 7, title: 'July' },
  { id: 8, title: 'August' },
  { id: 9, title: 'September' },
  { id: 10, title: 'October' },
  { id: 11, title: 'November' },
  { id: 12, title: 'December' },
]

export const SEARCH_MONTHS_BY_LEVEL: Record<number, { id: number, title: string }[]> = {
  22: [
    { id: 3, title: 'March' },
    { id: 6, title: 'May/Jun' },
    { id: 11, title: 'Oct/Nov' },
  ],
  23: [
    { id: 6, title: 'May/Jun' },
    { id: 11, title: 'Oct/Nov' },
  ],
  4161: [
    { id: 3, title: 'March' },
    { id: 6, title: 'May/Jun' },
    { id: 11, title: 'Oct/Nov' },
  ],
  6374: [
    { id: 6, title: 'May/Jun' },
    { id: 11, title: 'Oct/Nov' },
  ],
  6533: [
    { id: 6, title: 'May/Jun' },
    { id: 11, title: 'Oct/Nov' },
  ],
  6635: [
    { id: 3, title: 'March' },
    { id: 4, title: 'April' },
    { id: 5, title: 'May' },
    { id: 10, title: 'October' },
  ],
  6639: [
    { id: 3, title: 'March' },
    { id: 4, title: 'April' },
    { id: 5, title: 'May' },
    { id: 10, title: 'October' },
  ],
  6668: [
    { id: 1, title: 'January' },
    { id: 4, title: 'April' },
    { id: 6, title: 'June' },
    { id: 10, title: 'October' },
    { id: 11, title: 'November' },
  ],
  6669: [
    { id: 6, title: 'May/Jun' },
    { id: 11, title: 'Oct/Nov' },
  ],
  6670: [
    { id: 1, title: 'January' },
    { id: 4, title: 'April' },
    { id: 6, title: 'June' },
    { id: 10, title: 'October' },
    { id: 11, title: 'November' },
  ],
  6671: [
    { id: 6, title: 'May/Jun' },
    { id: 11, title: 'Oct/Nov' },
  ],
  6672: [
    { id: 6, title: 'June' },
    { id: 11, title: 'November' },
  ],
  6673: [{ id: 6, title: 'June' }],
  6674: [{ id: 6, title: 'June' }],
  6675: [
    { id: 6, title: 'May/Jun' },
    { id: 11, title: 'Oct/Nov' },
  ],
  6676: [
    { id: 6, title: 'June' },
    { id: 11, title: 'November' },
  ],
  6677: [
    { id: 6, title: 'June' },
    { id: 11, title: 'Oct/Nov' },
  ],
  6678: [
    { id: 6, title: 'June' },
    { id: 11, title: 'Oct/Nov' },
  ],
}

export const SEARCH_BOARD_ICON_BY_TITLE: Record<string, string> = {
  Cambridge: 'CIE',
  Edexcel: 'Edexcel',
  AQA: 'AQA',
  OCR: 'OCR',
  GAMA: 'GAMA',
  CXC: 'CXC',
  Nigerian: 'Nijeria',
}
