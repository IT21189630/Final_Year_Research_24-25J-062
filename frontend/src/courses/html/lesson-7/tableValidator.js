import { galacticData } from "./galactic-data";

export const validTable = new RegExp(
  `<table[^>]*>\\s*` + // Match the opening <table> tag with optional attributes
    `<tr>\\s*` + // Start of the header row
    `<th>\\s*${galacticData.tableHeads.field1}\\s*<\\/th>\\s*` + // Match Planet header with optional whitespace
    `<th>\\s*${galacticData.tableHeads.field2}\\s*<\\/th>\\s*` + // Match Moons header with optional whitespace
    `<th>\\s*${galacticData.tableHeads.field3}\\s*<\\/th>\\s*` + // Match Suitability header with optional whitespace
    `<th>\\s*${galacticData.tableHeads.field4}\\s*<\\/th>\\s*` + // Match Distance header with optional whitespace
    `<\\/tr>\\s*` + // Close header row
    // First data row (Mars)
    `<tr>\\s*` +
    `<td>\\s*${galacticData.record1.planetName}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record1.numberOfMoons}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record1.lifeSuitability}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record1.distance}\\s*<\\/td>\\s*` +
    `<\\/tr>\\s*` +
    // Second data row (Jupiter)
    `<tr>\\s*` +
    `<td>\\s*${galacticData.record2.planetName}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record2.numberOfMoons}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record2.lifeSuitability}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record2.distance}\\s*<\\/td>\\s*` +
    `<\\/tr>\\s*` +
    // Third data row (Venus)
    `<tr>\\s*` +
    `<td>\\s*${galacticData.record3.planetName}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record3.numberOfMoons}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record3.lifeSuitability}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record3.distance}\\s*<\\/td>\\s*` +
    `<\\/tr>\\s*` +
    // Fourth data row (Saturn)
    `<tr>\\s*` +
    `<td>\\s*${galacticData.record4.planetName}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record4.numberOfMoons}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record4.lifeSuitability}\\s*<\\/td>\\s*` +
    `<td>\\s*${galacticData.record4.distance}\\s*<\\/td>\\s*` +
    `<\\/tr>\\s*` +
    `<\\/table>`, // Match the closing </table> tag
  "i" // Case-insensitive flag
);
