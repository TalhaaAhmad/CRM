const PDFDocument = require('pdfkit');
const Order = require('../models/Order');
const fs = require('fs');
const path = require('path');

/**
 * Helper to draw a single courier slip matching the user's template
 */
const drawCourierSlip = (doc, order, x, y) => {
  const width = 530;
  const height = 380; 
  const col1Width = 135;
  const col2Width = width - col1Width;
  const rowHeight = 22;

  // Outer border
  doc.rect(x, y, width, height).stroke('#000000');

  // Helper to draw horizontal line
  const hLine = (yOffset) => {
    doc.moveTo(x, y + yOffset).lineTo(x + width, y + yOffset).stroke('#000000');
  };

  // Helper to draw vertical line at col1Width
  const vLine = (yStart, yEnd) => {
    doc.moveTo(x + col1Width, y + yStart).lineTo(x + col1Width, y + yEnd).stroke('#000000');
  };

  doc.fontSize(10).font('Helvetica-Bold');

  // Row 1: RECEIVER ADDRESS | DATE
  doc.text('RECEIVER ADDRESS', x + 5, y + 8);
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
  doc.text(`DATE:   ${dateStr}`, x + col1Width + 240, y + 8);
  hLine(rowHeight);
  vLine(0, rowHeight);

  // Row 2: NAME:
  doc.text('NAME:', x + 5, y + rowHeight + 8);
  doc.font('Helvetica').text(order.customerName ? order.customerName.toUpperCase() : '', x + col1Width + 5, y + rowHeight + 8);
  hLine(rowHeight * 2);
  vLine(rowHeight, rowHeight * 2);

  // Row 3: MOBILE NO :
  doc.font('Helvetica-Bold').text('MOBILE NO :', x + 5, y + rowHeight * 2 + 8);
  doc.font('Helvetica').text(order.phone || '', x + col1Width + 5, y + rowHeight * 2 + 8);
  hLine(rowHeight * 3);
  vLine(rowHeight * 2, rowHeight * 3);

  // Row 4: ADDRESS:
  doc.font('Helvetica-Bold').text('ADDRESS:', x + 5, y + rowHeight * 3 + 8);
  doc.font('Helvetica').text(`${order.address || ''} ${order.city || ''}`.toUpperCase(), x + col1Width + 5, y + rowHeight * 3 + 8, { width: col2Width - 10 });
  const addressHeight = 45; 
  hLine(rowHeight * 3 + addressHeight);
  vLine(rowHeight * 3, rowHeight * 3 + addressHeight);

  let currentY = rowHeight * 3 + addressHeight;

  // Row 5: PRODUCT DETAIL:
  doc.font('Helvetica-Bold').text('PRODUCT DETAIL:', x + 5, y + currentY + 8);
  const productDetailItems = order.products?.map(p => `${p.name || ''} x ${p.quantity || 1}`) || [];
  const productDetail = productDetailItems.length > 0 ? productDetailItems.join(', ') : 'MAJOON WARQ E SHIFA X 1';
  doc.font('Helvetica').text(productDetail.toUpperCase(), x + col1Width + 5, y + currentY + 8, { width: col2Width - 10 });
  const productHeight = 30;
  hLine(currentY + productHeight);
  vLine(currentY, currentY + productHeight);
  currentY += productHeight;

  // Row 6: COD AMOUNT:
  doc.font('Helvetica-Bold').text('COD  AMOUNT:', x + 5, y + currentY + 8);
  doc.font('Helvetica').text(order.orderAmount ? order.orderAmount.toString() : '0', x + col1Width + 5, y + currentY + 8);
  hLine(currentY + rowHeight);
  vLine(currentY, currentY + rowHeight);
  currentY += rowHeight;

  // Row 7: ID NUMBER:
  doc.font('Helvetica-Bold').text('ID  NUMBER:', x + 5, y + currentY + 8);
  const idNum = order._id.toString().slice(-5).toUpperCase();
  doc.font('Helvetica').text(idNum, x + col1Width + 5, y + currentY + 8);
  hLine(currentY + rowHeight);
  vLine(currentY, currentY + rowHeight);
  currentY += rowHeight;

  // Row 8: SENDER ADDRESS section
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('SENDER ADDRESS :', x + 5, y + currentY + 8);
  doc.text('SAQIB JAN', x + col1Width + 120, y + currentY + 8);
  doc.text('Pak HERBAL DAWAKHANA WARSAK ROAD KABAYAN STOP PESHAWAR', x + 5, y + currentY + 24, { align: 'center', width: width - 10 });
  const senderHeight = 45;
  hLine(currentY + senderHeight);
  currentY += senderHeight;

  // Row 9: Contact NO
  doc.font('Helvetica-Bold').text('Contact  NO : 03189542051', x + 5, y + currentY + 5);
  hLine(currentY + 18);
  currentY += 18;

  // Row 10: Footer
  doc.font('Helvetica-Bold').text('PSH 48 (B.U)', x + 5, y + currentY + 5);
  doc.text('POST PAID PESHAWAR GPO', x + 5, y + currentY + 40);
};

// @desc    Generate courier labels for selected orders
// @route   POST /api/courier/generate-labels
// @access  Private
exports.generateLabels = async (req, res) => {
  try {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of order IDs',
      });
    }

    // Fetch orders
    const orders = await Order.find({ _id: { $in: orderIds } });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No orders found',
      });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 20, size: 'A4' });
    const filename = `courier-labels-${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '../uploads', filename);

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Pipe PDF to file
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Generate labels (2 per page)
    orders.forEach((order, index) => {
      // Every 2 orders start a new page (except the first page)
      if (index > 0 && index % 2 === 0) {
        doc.addPage();
      }

      // Calculate Y position: Top for even indices (in each pair), Bottom for odd
      const yPos = (index % 2 === 0) ? 20 : 420;
      drawCourierSlip(doc, order, 30, yPos);
    });

    doc.end();

    // Wait for stream to finish
    stream.on('finish', () => {
      const fileUrl = `/api/courier/download/${filename}`;
      res.status(200).json({
        success: true,
        message: 'Labels generated successfully',
        count: orders.length,
        fileUrl,
        filename,
      });
    });

    stream.on('error', (err) => {
      console.error('PDF generation error:', err);
      res.status(500).json({ success: false, error: 'Failed to generate PDF' });
    });
  } catch (error) {
    console.error('Generate labels error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Download generated PDF
// @route   GET /api/courier/download/:filename
// @access  Private
exports.downloadLabel = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Preview single order label
// @route   GET /api/courier/preview/:orderId
// @access  Private
exports.previewLabel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const doc = new PDFDocument({ margin: 20, size: 'A4' });
    const filename = `label-preview-${order._id}.pdf`;
    const filepath = path.join(__dirname, '../uploads', filename);

    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Draw single slip at top of page
    drawCourierSlip(doc, order, 30, 20);

    doc.end();

    stream.on('finish', () => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.sendFile(filepath);
    });

    stream.on('error', (err) => {
      console.error('PDF preview error:', err);
      res.status(500).json({ success: false, error: 'Failed to generate preview' });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

