const PDFDocument = require('pdfkit');
const Complaint = require('../models/complaint');

const generateMonthlyReport = async (hostel, month, year) => {
    return new Promise(async (resolve, reject) => {
        try {

            // 1. Calculate the start and end dates for the selected month
            
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);

            // 2. Fetch the data from the database
            const complaints = await Complaint.find({
                hostel: hostel,
                createdAt: { $gte: startDate, $lte: endDate }
            }).populate('student', 'name room');

            if (!complaints || complaints.length === 0) {
                const error = new Error("No complaints found for this month.");
                error.statusCode = 404;
                return reject(error);
            }

            // 3. Aggregate Data for the Summary
            const total = complaints.length;
            const resolved = complaints.filter(c => c.status === 'resolved').length;
            const pending = complaints.filter(c => c.status === 'pending').length;

            // 4. Initialize PDFKit
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            // Listen for data to push to our buffer array
            doc.on('data', buffers.push.bind(buffers));
            
            // When the PDF is done, concat the buffers and resolve the promise
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            

            // Header
            doc.fontSize(20).text(`${hostel} Hostel Maintenance Report`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(14).text(`Period: ${startDate.toLocaleString('default', { month: 'long' })} ${year}`, { align: 'center' });
            doc.moveDown(2);

            // Summary Section
            doc.fontSize(16).text('Monthly Summary', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12).text(`Total Complaints Filed: ${total}`);
            doc.text(`Total Resolved: ${resolved}`);
            doc.text(`Currently Pending: ${pending}`);
            doc.moveDown(2);

            // Detailed List Section
            doc.fontSize(16).text('Complaint Details', { underline: true });
            doc.moveDown();

            complaints.forEach((comp, index) => {
                doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${comp.title} (${comp.category.toUpperCase()})`);
                doc.font('Helvetica').text(`Status: ${comp.status.toUpperCase()}`);
                doc.text(`Student: ${comp.student.name} | Room: ${comp.student.room}`);
                doc.text(`Date Filed: ${comp.createdAt.toLocaleDateString()}`);
                if (comp.resolvedAt) {
                    doc.text(`Date Resolved: ${comp.resolvedAt.toLocaleDateString()}`);
                }
                doc.moveDown();
            });

            // Finalize the PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateMonthlyReport };