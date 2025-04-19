const Razorpay = require("razorpay");
const axios = require("axios");

exports.razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.getReceiptDetails = async (receiptId) => {
  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/orders?receipt=${receiptId}`,
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_SECRET
        }
      }
    );

    const orders = response.data.items;

    if (orders.length > 0) {
      const order = orders[0]; // assuming one order per receipt
      console.log('Order status:', order.status); // created, paid, etc.
      console.log('Order ID:', order.id);
      console.log('Payments:', order.payments); // or fetch payments separately
    } else {
      console.log('No order found with that receipt.');
    }
  } catch (error) {
    console.error('Error fetching order:', error.response?.data || error.message);
  }
};