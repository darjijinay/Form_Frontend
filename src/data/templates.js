// Shared template library used across landing, dashboard, and templates pages.
export const TEMPLATE_LIBRARY = [
  {
    _id: "tpl1",
    title: "Workshop Registration",
    description: "Collect attendee details for your upcoming workshop or seminar.",
    category: "Events",
    formDetails: {
      title: "Workshop Registration Form",
      description: "Please fill out the form to register for the workshop.",
      subtitle: "A hands-on workshop on modern web development.",
      location: "Online via Zoom",
      date: "2025-12-30",
      time: "10:00",
      organizerName: " Events",
      organizerEmail: "events@gmail.com",
    },
    fields: [
      { _id: "f1", type: "short_text", label: "Full Name", required: true, placeholder: "Enter your full name", order: 0 },
      { _id: "f2", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "short_text", label: "Phone Number", required: false, placeholder: "+1 (555) 000-0000", order: 2 },
      { _id: "f4", type: "short_text", label: "Company/Organization", required: false, placeholder: "Your company name", order: 3 },
      { _id: "f5", type: "dropdown", label: "Dietary Requirements", required: false, options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Other"], order: 4 },
      { _id: "f6", type: "radio", label: "Preferred Session", required: true, options: ["Morning Session", "Afternoon Session"], order: 5 },
      { _id: "f7", type: "long_text", label: "Additional Comments", required: false, placeholder: "Any questions or special requirements?", order: 6 }
    ]
  },
  {
    _id: "tpl2",
    title: "Job Application",
    description: "Standard job application form with resume upload section.",
    category: "HR",
    formDetails: {
      title: "Job Application Form",
      description: "Please fill out your details to apply for the position.",
      salary: "e.g., $80,000 - $100,000",
      location: "e.g., San Francisco, CA",
      skills: "e.g., React, Node.js, MongoDB",
      deadline: "2025-12-31",
      employmentType: "e.g., Full-time",
    },
    fields: [
      { _id: "f1", type: "short_text", label: "Full Name", required: true, placeholder: "Enter your full name", order: 0 },
      { _id: "f2", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "short_text", label: "Phone Number", required: true, placeholder: "+1 (555) 000-0000", order: 2 },
      { _id: "f4", type: "short_text", label: "Position Applied For", required: true, placeholder: "e.g., Software Engineer", order: 3 },
      { _id: "f5", type: "dropdown", label: "Years of Experience", required: true, options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"], order: 4 },
      { _id: "f6", type: "file", label: "Upload Resume", required: true, placeholder: "PDF or DOC file", order: 5 },
      { _id: "f7", type: "long_text", label: "Cover Letter", required: false, placeholder: "Tell us why you're a great fit...", order: 6 },
      // { _id: "f8", type: "date", label: "Available Start Date", required: true, order: 7 } // Removed, add as custom field if needed
    ]
  },
  {
    _id: "tpl3",
    title: "Customer Feedback",
    description: "Gather insights from your customers about your product.",
    category: "Feedback",
    formDetails: {},
    fields: [
      { _id: "f1", type: "short_text", label: "Name", required: false, placeholder: "Your name (optional)", order: 0 },
      { _id: "f2", type: "email", label: "Email", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "short_text", label: "Product/Service Used", required: true, placeholder: "Which product did you use?", order: 2 },
      { _id: "f4", type: "radio", label: "Overall Rating", required: true, options: ["Poor", "Fair", "Good", "Very Good", "Excellent"], order: 3 },
      { _id: "f5", type: "radio", label: "Would you recommend us?", required: true, options: ["Yes", "No", "Maybe"], order: 4 },
      { _id: "f6", type: "long_text", label: "Your Feedback", required: true, placeholder: "Share your experience with us...", order: 5 },
      { _id: "f7", type: "long_text", label: "Suggestions for Improvement", required: false, placeholder: "What could we do better?", order: 6 }
    ]
  },
  {
    _id: "tpl4",
    title: "College Admission",
    description: "Comprehensive form for student admission inquiries.",
    category: "Education",
    formDetails: {},
    fields: [
      { _id: "f1", type: "short_text", label: "First Name", required: true, placeholder: "Enter first name", order: 0 },
      { _id: "f2", type: "short_text", label: "Last Name", required: true, placeholder: "Enter last name", order: 1 },
      { _id: "f3", type: "email", label: "Email Address", required: true, placeholder: "student@example.com", order: 2 },
      { _id: "f4", type: "short_text", label: "Phone Number", required: true, placeholder: "+1 ", order: 3 },
      // { _id: "f5", type: "date", label: "Date of Birth", required: true, order: 4 }, // Removed, add as custom field if needed
      { _id: "f6", type: "dropdown", label: "Program of Interest", required: true, options: ["Computer Science", "Engineering", "Business Administration", "Medicine", "Arts", "Other"], order: 5 },
      { _id: "f7", type: "short_text", label: "Current GPA", required: false, placeholder: "e.g., 3.8", order: 6 },
      { _id: "f8", type: "short_text", label: "High School Name", required: true, placeholder: "Your high school", order: 7 },
      { _id: "f9", type: "long_text", label: "Personal Statement", required: true, placeholder: "Tell us about yourself and why you want to join our institution...", order: 8 }
    ]
  },
  {
    _id: "tpl5",
    title: "Event ",
    description: "Simple RSVP form for parties, weddings, and corporate events.",
    category: "Events",
    formDetails: {},
    fields: [
      { _id: "f1", type: "short_text", label: "Full Name", required: true, placeholder: "Enter your name", order: 0 },
      { _id: "f2", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "radio", label: "Will you attend?", required: true, options: ["Yes, I'll be there", "No, I can't make it"], order: 2 },
      { _id: "f4", type: "number", label: "Number of Guests", required: false, placeholder: "Including yourself", order: 3 },
      { _id: "f5", "type": "dropdown", label: "Dietary Restrictions", required: false, options: ["None", "Vegetarian", "Vegan", "Gluten-Free", "Other"], order: 4 },
      { _id: "f6", type: "long_text", label: "Special Requests/Comments", required: false, placeholder: "Any special requirements or messages?", order: 5 }
    ]
  },
  {
    _id: "tpl6",
    title: "Contact Us",
    description: "Basic contact form for your website visitors.",
    category: "General",
    formDetails: {},
    fields: [
      { _id: "f1", type: "short_text", label: "Your Name", required: true, placeholder: "Enter your name", order: 0 },
      { _id: "f2", type: "email", label: "Email Address", required: true, placeholder: "your.email@example.com", order: 1 },
      { _id: "f3", type: "short_text", label: "Subject", required: true, placeholder: "What is this regarding?", order: 2 },
      { _id: "f4", type: "long_text", label: "Message", required: true, placeholder: "Write your message here...", order: 3 },
      { _id: "f5", type: "radio", label: "Preferred Contact Method", required: false, options: ["Email", "Phone"], order: 4 },
      { _id: "f6", type: "short_text", label: "Phone Number (optional)", required: false, placeholder: "+91 7874XXXXXX", order: 5 }
    ]
  },
];
