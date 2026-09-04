// src/utils/validators.js
// Using Yup for validation - install with: npm install yup
import * as Yup from 'yup';

// ========== Auth Validators ==========

export const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

export const registerSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .required('Name is required'),
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
    role: Yup.string()
        .oneOf(['student', 'trainer', 'admin'], 'Invalid role')
        .required('Role is required'),
    rollNo: Yup.string().when('role', {
        is: 'student',
        then: () => Yup.string().required('Roll number is required'),
    }),
    registrationNo: Yup.string().when('role', {
        is: 'student',
        then: () => Yup.string().required('Registration number is required'),
    }),
    semester: Yup.number().when('role', {
        is: 'student',
        then: () => Yup.number()
            .min(1, 'Semester must be at least 1')
            .max(10, 'Semester must be less than 10')
            .required('Semester is required'),
    }),
    department: Yup.string().when('role', {
        is: 'student',
        then: () => Yup.string().required('Department is required'),
    }),
    batch: Yup.string().when('role', {
        is: 'student',
        then: () => Yup.string().required('Batch is required'),
    }),
});

export const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
});

export const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
});

// ========== User Validators ==========

export const updateProfileSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    email: Yup.string().email('Invalid email address'),
    semester: Yup.number()
        .min(1, 'Semester must be at least 1')
        .max(10, 'Semester must be less than 10'),
    department: Yup.string(),
    batch: Yup.string(),
});

// ========== Subject Validators ==========

export const subjectSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Subject name must be at least 2 characters')
        .max(100, 'Subject name must be less than 100 characters')
        .required('Subject name is required'),
    code: Yup.string()
        .min(2, 'Subject code must be at least 2 characters')
        .max(20, 'Subject code must be less than 20 characters')
        .required('Subject code is required'),
    department: Yup.string().required('Department is required'),
    semester: Yup.number()
        .min(1, 'Semester must be at least 1')
        .max(10, 'Semester must be less than 10')
        .required('Semester is required'),
    description: Yup.string().max(500, 'Description must be less than 500 characters'),
});

// ========== Question Validators ==========

export const questionSchema = Yup.object().shape({
    subject: Yup.string().required('Subject is required'),
    questionText: Yup.string()
        .min(10, 'Question must be at least 10 characters')
        .required('Question text is required'),
    questionType: Yup.string()
        .oneOf(['MCQ', 'True/False', 'Short Answer', 'Essay'], 'Invalid question type')
        .required('Question type is required'),
    options: Yup.array().when('questionType', {
        is: (type) => type === 'MCQ',
        then: () => Yup.array()
            .of(Yup.string().required('Option cannot be empty'))
            .min(2, 'At least 2 options required')
            .max(6, 'Maximum 6 options allowed')
            .required('Options are required'),
    }),
    correctAnswer: Yup.mixed().required('Correct answer is required'),
    points: Yup.number()
        .min(1, 'Points must be at least 1')
        .max(100, 'Points must be less than 100')
        .required('Points are required'),
    difficulty: Yup.string()
        .oneOf(['Easy', 'Medium', 'Hard'], 'Invalid difficulty level'),
    explanation: Yup.string().max(1000, 'Explanation must be less than 1000 characters'),
});

// ========== Quiz Validators ==========

export const quizSchema = Yup.object().shape({
    title: Yup.string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must be less than 200 characters')
        .required('Title is required'),
    subject: Yup.string().required('Subject is required'),
    description: Yup.string()
        .max(1000, 'Description must be less than 1000 characters'),
    duration: Yup.number()
        .min(5, 'Duration must be at least 5 minutes')
        .max(300, 'Duration must be less than 300 minutes')
        .required('Duration is required'),
    totalMarks: Yup.number()
        .min(1, 'Total marks must be at least 1')
        .required('Total marks are required'),
    passingMarks: Yup.number()
        .min(0, 'Passing marks cannot be negative')
        .test('lessThanTotal', 'Passing marks must be less than total marks', function (value) {
            return value < this.parent.totalMarks;
        }),
    questions: Yup.array()
        .of(Yup.string())
        .min(1, 'At least one question is required')
        .required('Questions are required'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .required('End date is required'),
    maxAttempts: Yup.number()
        .min(1, 'Max attempts must be at least 1')
        .max(10, 'Max attempts must be less than 10'),
    shuffleQuestions: Yup.boolean(),
    showResults: Yup.boolean(),
    allowReview: Yup.boolean(),
});

// ========== Custom Validators ==========

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return {
        isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumber,
    };
};

export const validateRollNo = (rollNo) => {
    // Example: 23CS101
    const re = /^\d{2}[A-Z]{2,4}\d{3}$/;
    return re.test(rollNo);
};

export const validateRegistrationNo = (regNo) => {
    // Example: REG2023CS101
    const re = /^REG\d{4}[A-Z]{2,4}\d{3}$/;
    return re.test(regNo);
};
// ========== Usage Example ==========

// import { loginSchema, validateEmail } from './utils/validators';
// loginSchema.validate({ email: '
//     password: 'Password123' })
//     .then(() => {
//         // Valid data
//     })
//     .catch((err) => {
//         // Handle validation errors
//     });
// const isEmailValid = validateEmail('
// );
// console.log('Is email valid?', isEmailValid);test.com');
// console.log('Is email valid?', isEmailValid);
// );   
// );
            // setIsSubmitting(false);                 