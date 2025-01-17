const ExcelJS = require('exceljs');

const requestsData = [
    { item: "Item 1", accepted: 10, rejected: 2, pending: 3, shipping: 5 },
    { item: "Item 2", accepted: 8, rejected: 1, pending: 2, shipping: 6 },
    { item: "Item 3", accepted: 12, rejected: 0, pending: 1, shipping: 10 }
  ];
  
const inventoryData = [
{ item: "Item 1", stockStart: 100, stockEnd: 80 },
{ item: "Item 2", stockStart: 150, stockEnd: 145 },
{ item: "Item 3", stockStart: 200, stockEnd: 190 }
];

async function exportToExcel(req, res) {
    const workbook = new ExcelJS.Workbook();

    const requestsSheet = workbook.addWorksheet('Requests');

    requestsSheet.columns = [
        { header: 'Item', key: 'item', width: 20 },
        { header: 'Accepted', key: 'accepted', width: 12, style: { alignment: { horizontal: 'right' } } },
        { header: 'Rejected', key: 'rejected', width: 12, style: { alignment: { horizontal: 'right' } } },
        { header: 'Pending', key: 'pending', width: 12, style: { alignment: { horizontal: 'right' } } },
        { header: 'Shipping', key: 'shipping', width: 12, style: { alignment: { horizontal: 'right' } } },
        { header: 'Total', key: 'total', width: 15, style: { alignment: { horizontal: 'right' } } }
    ];

    requestsData.forEach((row) => {
        row.total = row.accepted + row.rejected + row.pending + row.shipping;
        requestsSheet.addRow(row);
        });

    const totalRequests = requestsData.reduce((acc, row) => acc + row.accepted, 0);
    const totalRejected = requestsData.reduce((acc, row) => acc + row.rejected, 0);
    const totalPending = requestsData.reduce((acc, row) => acc + row.pending, 0);
    const totalShipping = requestsData.reduce((acc, row) => acc + row.shipping, 0);
    const totalItems = requestsData.reduce((acc, row) => acc + row.total, 0);

    requestsSheet.addRow({
        item: 'Total',
        accepted: totalRequests,
        rejected: totalRejected,
        pending: totalPending,
        shipping: totalShipping,
        total: totalItems
    });

    const inventorySheet = workbook.addWorksheet('Inventory');

    inventorySheet.columns = [
        { header: 'Item', key: 'item', width: 20 },
        { header: 'Stock Level at Start', key: 'stockStart', width: 18, style: { alignment: { horizontal: 'right' } } },
        { header: 'Stock Level at End', key: 'stockEnd', width: 18, style: { alignment: { horizontal: 'right' } } },
        { header: 'Change', key: 'change', width: 12, style: { alignment: { horizontal: 'right' } } }
    ];

    inventoryData.forEach((row) => {
        row.change = row.stockStart - row.stockEnd;
        inventorySheet.addRow(row);
    });

    const totalStartStock = inventoryData.reduce((acc, row) => acc + row.stockStart, 0);
    const totalEndStock = inventoryData.reduce((acc, row) => acc + row.stockEnd, 0);
    const totalChange = inventoryData.reduce((acc, row) => acc + row.change, 0);

    inventorySheet.addRow({
        item: 'Total',
        stockStart: totalStartStock,
        stockEnd: totalEndStock,
        change: totalChange,
    });

    requestsSheet.getRow(1).font = { bold: true };
    inventorySheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
}

module.exports = {
    exportToExcel,
};