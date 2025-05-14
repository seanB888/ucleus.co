<?php
/**
 * Ucleus Email Subscription Handler
 * 
 * This script handles email submissions from the Ucleus landing page,
 * stores them in a MySQL database, and sends the free PDF.
 *
 * @version 1.0
 */

// Enable error reporting during development (remove in production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set headers to handle AJAX requests
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Database configuration - UPDATE THESE VALUES
define('DB_HOST', 'localhost');
define('DB_NAME', 'u652263477_ucleus_subscri');
define('DB_USER', 'u652263477_colorindex');
define('DB_PASS', '$Uc[u:Z8n');

// PDF file path (update this to the actual location of your PDF)
define('PDF_PATH', 'assets/downloads/top-10-ai-prompts.pdf');
define('PDF_FILENAME', 'Ucleus-Top-10-AI-Prompts.pdf');

// Get the email from the POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email'])) {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
} else {
    $email = trim($data['email']);
}

// Validate email
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
    exit;
}

// Connect to database
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    logError("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error. Please try again later.']);
    exit;
}

// Get subscriber info
$ip_address = getIpAddress();
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$source = $data['source'] ?? 'exit_popup';
$current_time = date('Y-m-d H:i:s');

// Try to insert the subscriber
try {
    // Check if email already exists
    $check_stmt = $pdo->prepare("SELECT id, email, unsubscribed FROM subscribers WHERE email = :email LIMIT 1");
    $check_stmt->execute([':email' => $email]);
    $existing_subscriber = $check_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing_subscriber) {
        // Subscriber exists, update the record
        if ($existing_subscriber['unsubscribed']) {
            // If they were unsubscribed, resubscribe them
            $update_stmt = $pdo->prepare("
                UPDATE subscribers 
                SET updated_at = :updated_at,
                    unsubscribed = 0,
                    source = :source
                WHERE email = :email
            ");
            
            $update_stmt->execute([
                ':updated_at' => $current_time,
                ':source' => $source,
                ':email' => $email
            ]);
            
            // Send PDF
            $send_result = sendPDF($email, $pdo);
            
            echo json_encode([
                'success' => true, 
                'message' => 'Welcome back! Your free PDF is on its way to your inbox.',
                'pdf_sent' => $send_result
            ]);
        } else {
            // Already subscribed and not unsubscribed
            echo json_encode([
                'success' => true, 
                'message' => 'You\'re already subscribed! We\'ve sent the PDF to your inbox again.',
                'pdf_sent' => sendPDF($email, $pdo)
            ]);
        }
    } else {
        // New subscriber, insert record
        $insert_stmt = $pdo->prepare("
            INSERT INTO subscribers (
                email, 
                source, 
                ip_address, 
                user_agent, 
                created_at, 
                updated_at
            ) VALUES (
                :email, 
                :source, 
                :ip_address, 
                :user_agent, 
                :created_at, 
                :updated_at
            )
        ");
        
        $insert_stmt->execute([
            ':email' => $email,
            ':source' => $source,
            ':ip_address' => $ip_address,
            ':user_agent' => $user_agent,
            ':created_at' => $current_time,
            ':updated_at' => $current_time
        ]);
        
        // Send PDF
        $send_result = sendPDF($email, $pdo);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Thank you! Your free PDF is on its way to your inbox.',
            'pdf_sent' => $send_result
        ]);
    }
    
} catch (PDOException $e) {
    logError("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save your email. Please try again.']);
    exit;
}

/**
 * Gets the real IP address of the visitor
 * 
 * @return string The IP address
 */
function getIpAddress() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    }
    return $ip;
}

/**
 * Sends the PDF to the subscriber
 * 
 * @param string $email The subscriber's email
 * @param PDO $pdo The database connection
 * @return bool Whether the email was sent successfully
 */
function sendPDF($email, $pdo) {
    try {
        // In a production environment, you would integrate with an email service
        // like SendGrid, Mailchimp, Amazon SES, etc.
        
        // For this example, we'll use PHP's mail function (not recommended for production)
        $to = $email;
        $from = "noreply@yourdomain.com"; // Update with your domain
        $subject = "Your Free 'Top 10 AI Prompts' PDF from Ucleus";
        
        // Generate a boundary for the multipart message
        $boundary = md5(time());
        
        // Headers
        $headers = "From: Ucleus <{$from}>\r\n";
        $headers .= "Reply-To: support@yourdomain.com\r\n"; // Update with your support email
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";
        
        // Email body
        $message = "--{$boundary}\r\n";
        $message .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $message .= "
        <html>
        <head>
            <title>Your Free Ucleus PDF</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9fafb; }
                .button { display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; 
                          text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .footer { font-size: 12px; color: #6b7280; margin-top: 30px; text-align: center; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Your Free PDF from Ucleus</h1>
                </div>
                <div class='content'>
                    <p>Hello,</p>
                    <p>Thank you for your interest in Ucleus! As promised, we've attached your free <strong>Top 10 AI Prompts</strong> PDF.</p>
                    <p>These expert-crafted prompts will help you:</p>
                    <ul>
                        <li>Save hours on research and writing tasks</li>
                        <li>Get more accurate and useful AI responses</li>
                        <li>Avoid common prompt mistakes that waste time</li>
                    </ul>
                    <p>If you find these prompts useful, you'll love our complete Ucleus app that teaches you to craft expert-level prompts for any situation.</p>
                    <p><a href='https://yourdomain.com' class='button'>Start Your Free Lesson Today</a></p>
                </div>
                <div class='footer'>
                    <p>© 2025 Ucleus AI. All rights reserved.</p>
                    <p>If you received this email by mistake, please ignore this message.</p>
                    <p>To unsubscribe, <a href='https://yourdomain.com/unsubscribe?email={$email}'>click here</a>.</p>
                </div>
            </div>
        </body>
        </html>
        \r\n";
        
        // Check if PDF exists before trying to attach it
        if (file_exists(PDF_PATH)) {
            // Read the PDF file content
            $file_content = file_get_contents(PDF_PATH);
            
            // Encode the content
            $encoded_content = chunk_split(base64_encode($file_content));
            
            // Add attachment
            $message .= "--{$boundary}\r\n";
            $message .= "Content-Type: application/pdf; name=\"" . PDF_FILENAME . "\"\r\n";
            $message .= "Content-Disposition: attachment; filename=\"" . PDF_FILENAME . "\"\r\n";
            $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $message .= $encoded_content . "\r\n";
            $message .= "--{$boundary}--";
            
            // Send email
            $mail_sent = mail($to, $subject, $message, $headers);
            
            // Update database to mark that PDF was sent
            if ($mail_sent) {
                $update_stmt = $pdo->prepare("UPDATE subscribers SET sent_pdf = 1 WHERE email = :email");
                $update_stmt->execute([':email' => $email]);
                return true;
            }
        } else {
            logError("PDF file not found at: " . PDF_PATH);
            return false;
        }
        
        /* 
         * For production, replace the mail() function with a proper email service API.
         * Example with SendGrid:
         *
         * require 'vendor/autoload.php';
         * $sendgrid = new \SendGrid('YOUR_API_KEY');
         * $email = new \SendGrid\Mail\Mail();
         * $email->setFrom("noreply@yourdomain.com", "Ucleus");
         * $email->setSubject("Your Free 'Top 10 AI Prompts' PDF");
         * $email->addTo($to);
         * $email->addContent("text/html", $html_content);
         * $file_encoded = base64_encode(file_get_contents(PDF_PATH));
         * $email->addAttachment($file_encoded, "application/pdf", PDF_FILENAME, "attachment");
         * $response = $sendgrid->send($email);
         * return $response->statusCode() == 202;
         */
        
        return $mail_sent;
        
    } catch (Exception $e) {
        logError("Error sending PDF: " . $e->getMessage());
        return false;
    }
}

/**
 * Logs error messages to a file
 * 
 * @param string $message The error message to log
 */
function logError($message) {
    $log_file = __DIR__ . '/email_errors.log';
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[{$timestamp}] {$message}" . PHP_EOL;
    
    // Append to log file
    file_put_contents($log_file, $log_message, FILE_APPEND);
}
