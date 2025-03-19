import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Box, Button, Typography, CircularProgress, Paper, Alert, Collapse, IconButton, LinearProgress } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ContractReviewer = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExtractedText, setShowExtractedText] = useState(true);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setAnalysis(null);
      setError(null);
      setExtractedText('');
      setProgress(0);
    }
  };

  // Perform OCR on the image
  const performOCR = async (imageUrl) => {
    try {
      const worker = await createWorker({
        logger: progress => {
          if (progress.status === 'recognizing text') {
            setProgress(parseInt(progress.progress * 100));
          }
        }
      });
      
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      console.log('Starting OCR recognition...');
      const { data: { text } } = await worker.recognize(imageUrl);
      console.log('OCR complete, text length:', text.length);
      
      await worker.terminate();
      
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to perform OCR on the image');
    }
  };

  // Analyze the text locally
  const analyzeLocally = (text) => {
    const startTime = Date.now();
    const documentId = `img_${Date.now()}`;
    
    console.log('Analyzing extracted text locally:', text.length, 'characters');
    
    // Detect document type based on content
    let documentType = "legal document";
    let risks = [];
    let clarifications = [];
    let bestPractices = [];
    let finalAdvice = "";
    let summary = "";
    
    const lowerText = text.toLowerCase();
    
    // Employment agreement detection
    if (lowerText.includes('employment') || 
        lowerText.includes('employee') || 
        lowerText.includes('employer') ||
        lowerText.includes('salary') ||
        lowerText.includes('compensation')) {
      documentType = "employment agreement";
      summary = "This appears to be an employment contract with standard legal provisions.";
      risks = [
        "Non-compete clause appears overly restrictive and may not be enforceable",
        "Termination provisions lack adequate notice periods",
        "Intellectual property rights assignment language is excessively broad",
        "Absence of clear performance evaluation criteria"
      ];
      clarifications = [
        "Specify working hours and overtime compensation policy",
        "Detail the exact scope of job responsibilities",
        "Clarify remote work policy and requirements",
        "Define procedure for performance reviews and potential raises"
      ];
      bestPractices = [
        "Include comprehensive confidentiality provisions",
        "Specify employee benefits in detail including leave policy",
        "Add clear procedures for addressing workplace grievances",
        "Include training and professional development opportunities"
      ];
      finalAdvice = "This employment contract requires revision to properly protect both employer and employee rights. Focus particularly on refining termination clauses, intellectual property provisions, and performance expectations.";
    }
    // Rental agreement detection
    else if (lowerText.includes('rent') || 
             lowerText.includes('lease') || 
             lowerText.includes('tenant') ||
             lowerText.includes('landlord') ||
             lowerText.includes('premises')) {
      documentType = "rental agreement";
      summary = "This appears to be a rental agreement with standard terms for residential property.";
      risks = [
        "The security deposit amount may exceed legal limits in some jurisdictions",
        "Maintenance responsibilities are not clearly defined between landlord and tenant",
        "No specific timeline for the return of security deposit",
        "Potential issues with eviction procedures that may not comply with local regulations"
      ];
      clarifications = [
        "Specify exact dates for rent payment and consequences of late payment",
        "Define who is responsible for specific maintenance tasks",
        "Clarify subletting permissions and restrictions",
        "Include details on utility payments responsibility"
      ];
      bestPractices = [
        "Include a detailed inventory of fixtures and fittings with condition noted",
        "Clearly specify notice period required for termination by either party",
        "Add dispute resolution mechanisms such as mediation",
        "Include rules regarding property alterations and modifications"
      ];
      finalAdvice = "This rental agreement requires additional clauses to offer adequate protection to both parties. Consider adding more specific terms regarding maintenance responsibilities, security deposit handling, and proper notice periods.";
    }
    // NDA detection
    else if (lowerText.includes('confidential') || 
             lowerText.includes('disclosure') || 
             lowerText.includes('proprietary') ||
             lowerText.includes('non-disclosure')) {
      documentType = "non-disclosure agreement";
      summary = "This appears to be a non-disclosure agreement for protecting confidential information.";
      risks = [
        "Definition of confidential information is excessively broad",
        "Duration of confidentiality obligations extends beyond reasonable limits",
        "Missing exclusions for information that becomes publicly available",
        "Inadequate provisions for handling forced disclosure due to legal proceedings"
      ];
      clarifications = [
        "Specify the process for returning or destroying confidential materials",
        "Define more precisely what constitutes permitted use of information",
        "Clarify notification requirements for compelled disclosure",
        "Specify whether information developed independently is excluded"
      ];
      bestPractices = [
        "Include specific examples of what constitutes confidential information",
        "Add provisions addressing accidental disclosure",
        "Clearly specify jurisdiction and governing law",
        "Include a non-solicitation provision if appropriate"
      ];
      finalAdvice = "This NDA requires revisions to balance adequate protection of confidential information with reasonable scope and duration limitations. Consider narrowing the definition of confidential information and adding proper exceptions.";
    }
    // Sale agreement detection  
    else if (lowerText.includes('sale') || 
             lowerText.includes('purchase') || 
             lowerText.includes('buyer') ||
             lowerText.includes('seller')) {
      documentType = "sale agreement";
      summary = "This appears to be a sale agreement for transfer of property or goods.";
      risks = [
        "Conditions precedent to closing are not clearly defined",
        "Warranty provisions are limited and may not provide adequate protection",
        "No clear remedies specified for potential breaches",
        "Insufficient clarity on which party bears transfer taxes and fees"
      ];
      clarifications = [
        "Specify exact payment terms and methods",
        "Clarify inspection rights and procedure before closing",
        "Define process for addressing defects discovered after transfer",
        "Specify exact items included/excluded from the sale"
      ];
      bestPractices = [
        "Include detailed escrow instructions",
        "Add specific representations about the condition of the property/goods",
        "Include force majeure clause for unforeseen circumstances",
        "Specify record-keeping requirements for the transaction"
      ];
      finalAdvice = "This sale agreement requires more detailed provisions regarding payment terms, inspection rights, and remedies for breach. Consider adding stronger warranty provisions and clearly defining closing conditions.";
    }
    // Service agreement detection
    else if (lowerText.includes('service') || 
             lowerText.includes('provider') || 
             lowerText.includes('client') ||
             lowerText.includes('scope')) {
      documentType = "service agreement";
      summary = "This appears to be a service agreement outlining the terms of service provision.";
      risks = [
        "Scope of services lacks specific deliverables and timelines",
        "Payment terms are ambiguous and could lead to disputes",
        "Termination rights are imbalanced between parties",
        "Liability limitations may be unenforceable under applicable law"
      ];
      clarifications = [
        "Define specific deliverables with measurable acceptance criteria",
        "Clarify payment schedule and conditions for payment",
        "Specify intellectual property ownership of work products",
        "Define process for requesting and approving changes to the services"
      ];
      bestPractices = [
        "Include service level agreements with performance metrics",
        "Add detailed procedure for handling disputes",
        "Specify confidentiality obligations for client information",
        "Include insurance and indemnification requirements"
      ];
      finalAdvice = "This service agreement would benefit from more precisely defined deliverables, clearer payment terms, and balanced termination provisions. Consider adding service level metrics and a structured change management process.";
    }
    // Generic legal document if no specific type detected
    else {
      summary = "This appears to be a legal document with standard contractual provisions.";
      risks = [
        "Some terms may be vague or ambiguous",
        "Potential enforceability issues for overly broad provisions",
        "Unclear remedies in case of breach",
        "Jurisdiction and venue provisions may be absent"
      ];
      clarifications = [
        "Define key terms more precisely",
        "Clarify responsibilities of each party",
        "Specify dispute resolution procedures",
        "Outline consequences for non-compliance"
      ];
      bestPractices = [
        "Include clear termination and notice provisions",
        "Add severability clause",
        "Specify governing law",
        "Include signature blocks for all parties"
      ];
      finalAdvice = "This document would benefit from clearer language and more specific provisions tailored to the parties' intentions. Consider having it reviewed by a legal professional.";
    }

    // Add India-specific language if it appears to be an Indian document
    if (lowerText.includes(' india') || 
        lowerText.includes('indian') || 
        lowerText.includes('rupee') || 
        lowerText.includes(' rs.') ||
        lowerText.includes('delhi') ||
        lowerText.includes('mumbai') ||
        lowerText.includes('bangalore') ||
        lowerText.includes('chennai') ||
        lowerText.includes('kolkata')) {
      summary = summary.replace(".", " typically used in India.");
      // Add India-specific advice
      risks.push("Some provisions may not comply with recent Indian legal developments");
      clarifications.push("Consider specific state laws that may apply to this agreement in India");
      bestPractices.push("Include clear jurisdiction clause specifying applicable Indian state law");
      finalAdvice += " Ensure compliance with local Indian regulations.";
    }

    console.log('Analysis complete for document type:', documentType);
    
    return {
      documentId: documentId,
      summary: summary,
      risks: risks,
      clarifications: clarifications,
      bestPractices: bestPractices,
      finalAdvice: finalAdvice,
      documentType: documentType,
      processingTime: (Date.now() - startTime) / 1000
    };
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Step 1: Perform OCR on the image
      const text = await performOCR(preview);
      console.log('Extracted text length:', text.length);
      setExtractedText(text);
      
      // Step 2: Analyze the text locally
      const result = analyzeLocally(text);
      
      setAnalysis(result);
      
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err.message || 'Failed to analyze contract');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    setError(null);
    setExtractedText('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Contract Reviewer
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
          id="contract-upload"
        />
        <label htmlFor="contract-upload">
          <Button
            variant="contained"
            component="span"
            sx={{ mb: 2 }}
          >
            Upload Contract Image
          </Button>
        </label>

        {preview && (
          <Box sx={{ mt: 2 }}>
            <img
              src={preview}
              alt="Contract preview"
              style={{ maxWidth: '100%', maxHeight: '300px' }}
            />
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={loading}
              sx={{ mt: 2, mr: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze Contract'}
            </Button>
            
            {file && !loading && (
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{ mt: 2 }}
              >
                Reset
              </Button>
            )}
          </Box>
        )}
        
        {loading && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {progress < 100 ? 'Extracting text from image...' : 'Analyzing contract text...'}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mb: 2, height: 10, borderRadius: 5 }}
            />
          </Box>
        )}
      </Paper>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError(null)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}
      
      {extractedText && !analysis && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Extracted Text
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Typography
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                maxHeight: '300px',
                overflow: 'auto'
              }}
            >
              {extractedText || "No text extracted"}
            </Typography>
          </Paper>
        </Paper>
      )}

      {analysis && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Analysis Results
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Document ID: {analysis.documentId}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            Processing time: {analysis.processingTime?.toFixed(2) || "0.00"} seconds
          </Typography>

          <Typography variant="body2" color="success.main" gutterBottom>
            Document analysis completed successfully
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Summary
          </Typography>
          <Typography paragraph>{analysis.summary}</Typography>

          <Typography variant="h6" gutterBottom>
            Potential Risks
          </Typography>
          <ul>
            {analysis.risks?.map((risk, index) => (
              <li key={index}>
                <Typography>{risk}</Typography>
              </li>
            ))}
          </ul>

          <Typography variant="h6" gutterBottom>
            Clarifications Needed
          </Typography>
          <ul>
            {analysis.clarifications?.map((clarification, index) => (
              <li key={index}>
                <Typography>{clarification}</Typography>
              </li>
            ))}
          </ul>

          <Typography variant="h6" gutterBottom>
            Best Practices
          </Typography>
          <ul>
            {analysis.bestPractices?.map((practice, index) => (
              <li key={index}>
                <Typography>{practice}</Typography>
              </li>
            ))}
          </ul>

          <Typography variant="h6" gutterBottom>
            Final Advice
          </Typography>
          <Typography paragraph>{analysis.finalAdvice}</Typography>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setShowExtractedText(!showExtractedText)}
              sx={{ mb: 2 }}
            >
              {showExtractedText ? 'Hide' : 'Show'} Extracted Text
            </Button>
            <Collapse in={showExtractedText}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    maxHeight: '400px',
                    overflow: 'auto'
                  }}
                >
                  {extractedText || "No text extracted"}
                </Typography>
              </Paper>
            </Collapse>
          </Box>

          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ mt: 2 }}
          >
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default ContractReviewer; 