#!/usr/bin/env node
/**
 * Express API Server - JavaScript version
 */



// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Store for analysis results

/**
 * GET /api/health - Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/scan - Initiate project scan
 */
app.post('/api/scan', async (req, res) => {
  try {

    if (!projectPath) {
      return res.status(400).json({ error: 'projectPath is required' });
    }

    console.log(`Starting scan for project: ${projectPath}`);


    // Cache the report
    analysisCache.set(reportId, report);

    res.json({
      success: true,
      reportId,
      summary: {
        totalFiles: report.totalFiles,
        totalNodes: report.totalNodes,
        deadCodeItems: report.deadCodeItems.length,
        codeReductionPercentage: report.codeReductionPercentage,
        confidenceScore: report.confidenceScore,
      },
    });
  } catch (error) {
    console.error('Scan error:', error.message);
    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * GET /api/report/:reportId - Get analysis report
 */
app.get('/api/report/:reportId', (req, res) => {

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json(report);
});

/**
 * POST /api/cleanup-proposal - Generate cleanup proposal
 */
app.post('/api/cleanup-proposal', (req, res) => {
  try {

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }


    cleanupProposals.set(proposalId, proposal);

    res.json({
      proposalId,
      summary: {
        safeToDelete: proposal.safeToDelete.length,
        uncertain: proposal.uncertain.length,
      },
      preview: cleaner.previewChanges(proposal),
    });
  } catch (error) {
    console.error('Cleanup proposal error:', error.message);
    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * POST /api/cleanup-execute - Execute cleanup
 */
app.post('/api/cleanup-execute', (req, res) => {
  try {

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }


    res.json({
      success: true,
      removed: result.removed,
      failed: result.failed,
      message: `Removed ${result.removed} dead code items`,
    });
  } catch (error) {
    console.error('Cleanup execution error:', error.message);
    res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * GET /api/report/:reportId/export - Export report as JSON
 */
app.get('/api/report/:reportId/export', (req, res) => {

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="adc-report-${report.scanDate}.json"`);
  res.json(report);
});

/**
 * Start server
 */
app.listen(port, () => {
  console.log(`✓ ADC API Server running on http://localhost:${port}`);
  console.log(`✓ API Documentation: http://localhost:${port}/api`);
});

module.exports = app;
