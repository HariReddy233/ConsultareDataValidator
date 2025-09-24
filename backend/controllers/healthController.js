// Health check controller
class HealthController {
  // GET /health - Health check endpoint
  static async healthCheck(req, res) {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = HealthController;
