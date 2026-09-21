import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingBlock } from '../components/ui/States.jsx';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute.jsx';
import { ScrollToTop } from './ScrollToTop.jsx';

import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';

/* Public pages */
const Home = lazy(() => import('../pages/Home.jsx'));
const About = lazy(() => import('../pages/About.jsx'));
const CareerServices = lazy(() => import('../pages/CareerServices.jsx'));
const Pricing = lazy(() => import('../pages/Pricing.jsx'));
const Upskills = lazy(() => import('../pages/Upskills.jsx'));
const HigherEducation = lazy(() => import('../pages/HigherEducation.jsx'));
const Courses = lazy(() => import('../pages/Courses.jsx'));
const CourseDetail = lazy(() => import('../pages/CourseDetail.jsx'));
const ProfessionalCourses = lazy(() => import('../pages/ProfessionalCourses.jsx'));
const DubaiPackage = lazy(() => import('../pages/DubaiPackage.jsx'));
const Documentation = lazy(() => import('../pages/Documentation.jsx'));
const AtsResumeChecker = lazy(() => import('../pages/AtsResumeChecker.jsx'));
const LinkedInOptimizer = lazy(() => import('../pages/career-tools/LinkedInOptimizer.jsx'));
const CoverLetter = lazy(() => import('../pages/career-tools/CoverLetter.jsx'));
const InterviewCoach = lazy(() => import('../pages/career-tools/InterviewCoach.jsx'));
const Jobs = lazy(() => import('../pages/Jobs.jsx'));
const JobDetail = lazy(() => import('../pages/JobDetail.jsx'));
const Employer = lazy(() => import('../pages/Employer.jsx'));
const Blog = lazy(() => import('../pages/Blog.jsx'));
const BlogPost = lazy(() => import('../pages/BlogPost.jsx'));
const Faq = lazy(() => import('../pages/Faq.jsx'));
const Contact = lazy(() => import('../pages/Contact.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

/* Legal */
const Privacy = lazy(() => import('../pages/legal/Privacy.jsx'));
const Terms = lazy(() => import('../pages/legal/Terms.jsx'));
const Cancellation = lazy(() => import('../pages/legal/Cancellation.jsx'));
const Refund = lazy(() => import('../pages/legal/Refund.jsx'));

/* Auth */
const Login = lazy(() => import('../pages/auth/Login.jsx'));
const Register = lazy(() => import('../pages/auth/Register.jsx'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword.jsx'));

/* Dashboard (candidate + employer) */
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard.jsx'));
const Assistant = lazy(() => import('../pages/dashboard/Assistant.jsx'));
const Profile = lazy(() => import('../pages/dashboard/Profile.jsx'));
const Applications = lazy(() => import('../pages/dashboard/Applications.jsx'));
const SavedJobs = lazy(() => import('../pages/dashboard/SavedJobs.jsx'));
const EmployerJobs = lazy(() => import('../pages/dashboard/EmployerJobs.jsx'));
const EmployerJobForm = lazy(() => import('../pages/dashboard/EmployerJobForm.jsx'));
const EmployerApplications = lazy(() => import('../pages/dashboard/EmployerApplications.jsx'));

/* Admin */
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.jsx'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers.jsx'));
const AdminJobs = lazy(() => import('../pages/admin/AdminJobs.jsx'));
const AdminApplications = lazy(() => import('../pages/admin/AdminApplications.jsx'));
const AdminCourses = lazy(() => import('../pages/admin/AdminCourses.jsx'));
const AdminBlogs = lazy(() => import('../pages/admin/AdminBlogs.jsx'));
const AdminFaqs = lazy(() => import('../pages/admin/AdminFaqs.jsx'));
const AdminConsultations = lazy(() => import('../pages/admin/AdminConsultations.jsx'));
const AdminMessages = lazy(() => import('../pages/admin/AdminMessages.jsx'));
const AdminTestimonials = lazy(() => import('../pages/admin/AdminTestimonials.jsx'));

function PageFallback() {
  return <LoadingBlock label="Loading" className="min-h-[50vh]" />;
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="career-services" element={<CareerServices />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="upskills" element={<Upskills />} />
            <Route path="higher-education" element={<HigherEducation />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:slug" element={<CourseDetail />} />
            <Route path="professional-courses" element={<ProfessionalCourses />} />
            <Route path="dubai-job-seeker-package" element={<DubaiPackage />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="ats-resume-checker" element={<AtsResumeChecker />} />
            <Route path="career-tools/linkedin" element={<LinkedInOptimizer />} />
            <Route path="career-tools/cover-letter" element={<CoverLetter />} />
            <Route path="career-tools/interview" element={<InterviewCoach />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:idOrSlug" element={<JobDetail />} />
            <Route path="employer" element={<Employer />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="faq" element={<Faq />} />
            <Route path="contact" element={<Contact />} />

            <Route path="privacy-policy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="cancellation-policy" element={<Cancellation />} />
            <Route path="refund-policy" element={<Refund />} />

            {/* Candidate-only pages, nested under the public shell so they
                keep the marketing nav rather than the app shell. */}
            <Route element={<ProtectedRoute roles={['user']} />}>
              <Route path="applications" element={<Applications />} />
              <Route path="saved-jobs" element={<SavedJobs />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>
          </Route>

          {/* Signed-in app shell: candidates and employers share it, admins
              are redirected to their own shell below. */}
          <Route element={<ProtectedRoute roles={['user', 'employer']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route element={<ProtectedRoute roles={['user']} />}>
                <Route path="assistant" element={<Assistant />} />
              </Route>
              <Route element={<ProtectedRoute roles={['employer']} />}>
                <Route path="employer/jobs" element={<EmployerJobs />} />
                <Route path="employer/jobs/new" element={<EmployerJobForm />} />
                <Route path="employer/jobs/:id/edit" element={<EmployerJobForm />} />
                <Route path="employer/applications" element={<EmployerApplications />} />
              </Route>
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/jobs" element={<AdminJobs />} />
              <Route path="admin/applications" element={<AdminApplications />} />
              <Route path="admin/courses" element={<AdminCourses />} />
              <Route path="admin/blogs" element={<AdminBlogs />} />
              <Route path="admin/faqs" element={<AdminFaqs />} />
              <Route path="admin/consultations" element={<AdminConsultations />} />
              <Route path="admin/messages" element={<AdminMessages />} />
              <Route path="admin/testimonials" element={<AdminTestimonials />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
