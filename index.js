const questions = [
    {
      "question": "Which set of Amazon S3 features helps to prevent and recover from accidental data loss?",
      "options": ["Object lifecycle and service access logging.", "Object versioning and Multi-factor authentication.", "Access controls and server-side encryption.", "Website hosting and Amazon S3 policies."],
      "answer": "Object versioning and Multi-factor authentication."
    },
    {
      "question": "What is the minimum time Interval for the data that Amazon CloudWatch receives and aggregates?",
      "options": ["One second.", "Five seconds.", "One minute.", "Three minutes.", "Five minutes."],
      "answer": "One minute."
    },
    {
      "question": "A user has launched an EC2 instance. The instance got terminated as soon as it was launched. Which of the below mentioned options is not a possible reason for this?",
      "options": ["The user account has reached the maximum volume limit.", "The AMI is missing. It is the required part.", "The snapshot is corrupt.", "The user account has reached the maximum EC2 instance limit."],
      "answer": "The user account has reached the maximum EC2 instance limit."
    },
    {
      "question": "Your website is serving on-demand training videos to your workforce. Videos are uploaded monthly in high resolution MP4 format. Your workforce is distributed globally often on the move and using company-provided tablets that require the HTTP Live Streaming (HLS) protocol to watch a video. Your company has no video transcoding expertise and it required you may need to pay for a consultant. How do you implement the most cost-efficient architecture without compromising high availability and quality of video delivery?",
      "options": [
        "A video transcoding pipeline running on EC2 using SQS to distribute tasks and Auto Scaling to adjust the number of nodes depending on the length of the queue. EBS volumes to host videos and EBS snapshots to incrementally backup original files after a few days. CloudFront to serve HLS transcoded videos from EC2.",
        "Elastic Transcoder to transcode original high-resolution MP4 videos to HLS. EBS volumes to host videos and EBS snapshots to incrementally backup original files after a few days. CloudFront to serve HLS transcoded videos from EC2.",
        "Elastic Transcoder to transcode original high-resolution MP4 videos to HLS. S3 to host videos with Lifecycle Management to archive original files to Glacier after a few days. CloudFront to serve HLS transcoded videos from S3.",
        "A video transcoding pipeline running on EC2 using SQS to distribute tasks and Auto Scaling to adjust the number of nodes depending on the length of the queue. S3 to host videos with Lifecycle Management to archive all files to Glacier after a few days. CloudFront to serve HLS transcoded videos from Glacier."
      ],
      "answer": "Elastic Transcoder to transcode original high-resolution MP4 videos to HLS. S3 to host videos with Lifecycle Management to archive original files to Glacier after a few days. CloudFront to serve HLS transcoded videos from S3."
    },
    {
      "question": "You are designing an intrusion detection prevention (IDS/IPS) solution for a customer web application in a single VPC. You are considering the options for implementing IOS IPS protection for traffic coming from the Internet. Which of the following options would you consider? (Choose 2 answers)",
      "options": [
        "Implement IDS/IPS agents on each Instance running in VPC.",
        "Configure an instance in each subnet to switch its network interface card to promiscuous mode and analyze network traffic.",
        "Implement Elastic Load Balancing with SSL listeners in front of the web applications.",
        "Implement a reverse proxy layer in front of web servers and configure IDS/ IPS agents on each reverse proxy server."
      ],
      "answer": "Implement IDS/IPS agents on each Instance running in VPC. Implement a reverse proxy layer in front of web servers and configure IDS/ IPS agents on each reverse proxy server."
    },
    {
      "question": "Which of the following are valid statements about Amazon S3? (Choose 2 answers)",
      "options": [
        "Amazon S3 provides read-after-write consistency for any type of PUT or DELETE.",
        "Consistency is not guaranteed for any type of PUT or DELETE.",
        "A successful response to a PUT request only occurs when a complete object is saved.",
        "Partially saved objects are immediately readable with a GET after an overwrite PUT.",
        "S3 provides eventual consistency for overwrite PUTS and DELETE."
      ],
      "answer": "A successful response to a PUT request only occurs when a complete object is saved. S3 provides eventual consistency for overwrite PUTS and DELETE."
    },
    {
      "question": "How can the domain's zone apex, for example, 'myzoneapexdomain.com', be pointed towards an Elastic Load Balancer?",
      "options": ["By using an Amazon Route 53 Alias record.", "By using an AAAA record.", "By using an Amazon Route 53 CNAME record.", "By using an A record."],
      "answer": "By using an Amazon Route 53 Alias record."
    },
    {
      "question": "When should I choose Provisioned IOPS over Standard RDS storage?",
      "options": ["If you have batch-oriented workloads.", "If you use production online transaction processing (OLTP) workloads.", "If you have workloads that are not sensitive to consistent performance."],
      "answer": "If you have batch-oriented workloads."
    },
    {
      "question": "Your department creates regular analytics reports from your company's log files. All log data is collected in Amazon S3 and processed by daily Amazon Elastic MapReduce (EMR) jobs that generate daily PDF reports and aggregated tables in CSV format for an Amazon Redshift data warehouse. Which of the following alternatives will lower costs without compromising average performance of the system or data integrity for the raw data?",
      "options": [
        "Use reduced redundancy storage (RRS) for all data in S3. Use a combination of Spot Instances and Reserved Instances for Amazon EMR jobs. Use Reserved Instances for Amazon Redshift.",
        "Use reduced redundancy storage (RRS) for PDF and .csv data in S3. Add Spot Instances to EMR jobs. Use Spot Instances for Amazon Redshift.",
        "Use reduced redundancy storage (RRS) for PDF and .csv data in Amazon S3. Add Spot Instances to Amazon EMR jobs. Use Reserved Instances for Amazon Redshift.",
        "Use reduced redundancy storage (RRS) for all data in Amazon S3. Add Spot Instances to Amazon EMR jobs. Use Reserved Instances for Amazon Redshift."
      ],
      "answer": "Use reduced redundancy storage (RRS) for PDF and .csv data in Amazon S3. Add Spot Instances to Amazon EMR jobs. Use Reserved Instances for Amazon Redshift."
    },
    {
      "question": "Because of the extensibility limitations of striped storage attached to Windows Server, Amazon RDS does not currently support increasing storage on a [...] DB Instance.",
      "options": ["SQL Server.", "MySQL.", "Oracle."],
      "answer": "SQL Server."
    },
    {
      "question": "In regards to IAM you can edit user properties later, but you cannot use the console to change the [...].",
      "options": ["user name.", "password.", "default group."],
      "answer": "user name."
    },
    {
      "question": "In Amazon EC2 Container Service, are other container types supported?",
      "options": [
        "Yes, EC2 Container Service supports any container service you need.",
        "Yes, EC2 Container Service also supports Microsoft container service.",
        "No, Docker is the only container platform supported by EC2 Container Service presently.",
        "Yes, EC2 Container Service supports Microsoft container service and Openstack."
      ],
      "answer": "No, Docker is the only container platform supported by EC2 Container Service presently."
    },
    {
      "question": "Content and Media Server is the latest requirement that you need to meet for a client. The client has been very specific about his requirements such as low latency, high availability, durability, and access control. Potentially there will be millions of views on this server and because of 'spiky' usage patterns, operations teams will need to provision static hardware, network, and management resources to support the maximum expected need. The Customer base will be initially low but is expected to grow and become more geographically distributed. Which of the following would be a good solution for content distribution?",
      "options": [
        "Amazon S3 as both the origin server and for caching.",
        "AWS Storage Gateway as the origin server and Amazon EC2 for caching.",
        "AWS CloudFront as both the origin server and for caching.",
        "Amazon S3 as the origin server and Amazon CloudFront for caching."
      ],
      "answer": "Amazon S3 as the origin server and Amazon CloudFront for caching."
    },
    {
      "question": "Name the disk storage supported by Amazon Elastic Compute Cloud (EC2)",
      "options": ["None of these.", "Amazon AppStream store.", "Amazon SNS store.", "Amazon Instance Store."],
      "answer": "Amazon Instance Store."
    },
    {
      "question": "After an Amazon VPC instance is launched, can I change the VPC security groups it belongs to?",
      "options": ["Only if the tag 'VPC_Change_Group' is true.", "Yes. You can.", "No. You cannot.", "Only if the tag 'VPC Change Group' is true."],
      "answer": "Yes. You can."
    },
    {
      "question": "If I want an instance to have a public IP address, which IP address should I use?",
      "options": ["Elastic IP Address.", "Class B IP Address.", "Class A IP Address.", "Dynamic IP Address."],
      "answer": "Elastic IP Address."
    },
    {
      "question": "Amazon RDS supports SOAP only through [...].",
      "options": ["HTTP or HTTPS.", "TCP/IP.", "HTTP.", "HTTPS."],
      "answer": "HTTPS."
    },
    {
      "question": "Which of the following services natively encrypts data at rest within an AWS region? (Choose 2 answers)",
      "options": ["AWS Storage Gateway.", "Amazon DynamoDB.", "Amazon CloudFront.", "Amazon Glacier.", "Amazon Simple Queue Service."],
      "answer": "AWS Storage Gateway. Amazon Glacier."
    },
    {
      "question": "Which one of the following can't be used as an origin server with Amazon CloudFront?",
      "options": ["A web server running in your infrastructure.", "Amazon S3.", "Amazon Glacier.", "A web server running on Amazon EC2 instances."],
      "answer": "Amazon Glacier."
    },
    {
      "question": "Select the most correct The device name /dev/sdal (within Amazon EC2) is [...].",
      "options": ["possible for EBS volumes.", "reserved for the root device.", "recommended for EBS volumes.", "recommended for instance store volumes."],
      "answer": "reserved for the root device."
    }
  ];

let currentQuestionIndex = 0;
let score = 0;
let totalTime = 3600; // 1 hour in seconds
let timerInterval;

function loadQuestion() {
    if (currentQuestionIndex < questions.length) {
        const questionContainer = document.getElementById('question');
        questionContainer.innerHTML = `<h2>Question ${currentQuestionIndex + 1}:</h2><p>${questions[currentQuestionIndex].question}</p>`;
        
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        questions[currentQuestionIndex].options.forEach(option => {
            optionsContainer.innerHTML += `
                <label align=left>
                    <input type="radio" name="option" value="${option}">
                    ${option}
                </label>
            `;
        });

        document.getElementById('result').innerHTML = ''; // Clear previous result message
        document.getElementById('next').classList.add('hidden'); // Hide next button
        document.getElementById('final-result').classList.add('hidden'); // Hide final result
    } else {
        showFinalResult();
    }
}

function submitAnswer() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) {
        alert("Please select an option.");
        return;
    }

    const correctAnswer = questions[currentQuestionIndex].answer;
    const resultContainer = document.getElementById('result');

    if (selectedOption.value === correctAnswer) {
        score++;
        resultContainer.innerHTML = `Correct Answer: ${correctAnswer}`;
        resultContainer.classList.add('green');
        resultContainer.classList.remove('red');
    } else {
        resultContainer.innerHTML = `Correct Answer: ${correctAnswer}`;
        resultContainer.classList.add('red');
        resultContainer.classList.remove('green');
    }

    document.getElementById('submit').classList.add('hidden');
    document.getElementById('next').classList.remove('hidden'); // Show next button
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
    document.getElementById('submit').classList.remove('hidden'); // Show submit button for next question
    document.getElementById('next').classList.add('hidden'); // Hide next button
}

function showFinalResult() {
    const finalResultContainer = document.getElementById('final-result');
    finalResultContainer.innerHTML = `<h3>Thank you for completing the quiz!</h3>`;
    finalResultContainer.innerHTML += `You scored ${score} out of ${questions.length}.<br>`;
    questions.forEach((q, index) => {
        finalResultContainer.innerHTML += `Question ${index + 1}: ${q.question} <br> Correct Answer - ${q.answer}<br><br>`;
    });
    finalResultContainer.innerHTML += `<a href="#" onclick="resetQuiz()">Reset Quiz</a>`;
    
    finalResultContainer.classList.remove('hidden'); // Show final result
    document.getElementById('question-card').style.display = 'none'; // Hide questions
    clearInterval(timerInterval); // Stop the timer
}

function startTimer() {
    timerInterval = setInterval(() => {
        totalTime--;
        document.getElementById('time').innerText = totalTime;

        if (totalTime <= 0) {
            clearInterval(timerInterval);
            showFinalResult();
            document.getElementById('question-card').style.display = 'none';
        }
    }, 1000);
}

function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    totalTime = 3600; // Reset timer
    loadQuestion();
    document.getElementById('question-card').style.display = 'block'; // Show questions again
    document.getElementById('result').innerHTML = ''; // Clear previous results
    document.getElementById('final-result').classList.add('hidden'); // Hide final result
    startTimer(); // Restart timer
}

document.getElementById('submit').addEventListener('click', submitAnswer);
document.getElementById('next').addEventListener('click', nextQuestion);
loadQuestion();
startTimer();
