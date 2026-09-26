import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingBlock } from '../components/ui/States.jsx';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute.jsx';
import { ScrollToTop } from './ScrollToTop.jsx';

import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import { lazyWithReload } from '../utils/lazyWithReload.js';

/* Public pages */
const Home = lazyWithReload(() => import('../pages/Home.jsx'));
const About = lazyWithReload(() => import('../pages/About.jsx'));
const CareerServices = lazyWithReload(() => import('../pages/CareerServices.jsx'));
const Pricing = lazyWithReload(() => import('../pages/Pricing.jsx'));
const CvBuilder = lazyWithReload(() => import('../pages/CvBuilder.jsx'));
const CvTemplates = lazyWithReload(() => import('../pages/CvTemplates.jsx'));
const Upskills = lazyWithReload(() => import('../pages/Upskills.jsx'));
const HigherEducation = lazyWithReload(() => import('../pages/HigherEducation.jsx'));
const Courses = lazyWithReload(() => import('../pages/Courses.jsx'));
const CourseDetail = lazyWithReload(() => import('../pages/CourseDetail.jsx'));
const ProfessionalCourses = lazyWithReload(() => import('../pages/ProfessionalCourses.jsx'));
const ProgrammeDetail = lazyWithReload(() => import('../pages/ProgrammeDetail.jsx'));
const PartnerProfile = lazyWithReload(() => import('../pages/dashboard/PartnerProfile.jsx'));
const AdminPartners = lazyWithReload(() => import('../pages/admin/AdminPartners.jsx'));
const DubaiPackage = lazyWithReload(() => import('../pages/DubaiPackage.jsx'));
const Documentation = lazyWithReload(() => import('../pages/Documentation.jsx'));
const AtsResumeChecker = lazyWithReload(() => import('../pages/AtsResumeChecker.jsx'));
const LinkedInOptimizer = lazyWithReload(() => import('../pages/career-tools/LinkedInOptimizer.jsx'));
const CoverLetter = lazyWithReload(() => import('../pages/career-tools/CoverLetter.jsx'));
const InterviewCoach = lazyWithReload(() => import('../pages/career-tools/InterviewCoach.jsx'));
const Jobs = lazyWithReload(() => import('../pages/Jobs.jsx'));
const JobDetail = lazyWithReload(() => import('../pages/JobDetail.jsx'));
const Employer = lazyWithReload(() => import('../pages/Employer.jsx'));
const Blog = lazyWithReload(() => import('../pages/Blog.jsx'));
const BlogPost = lazyWithReload(() => import('../pages/BlogPost.jsx'));
const Faq = lazyWithReload(() => import('../pages/Faq.jsx'));
const Contact = lazyWithReload(() => import('../pages/Contact.jsx'));
const NotFound = lazyWithReload(() => import('../pages/NotFound.jsx'));

/* Legal */
const Privacy = lazyWithReload(() => import('../pages/legal/Privacy.jsx'));
const Terms = lazyWithReload(() => import('../pages/legal/Terms.jsx'));
const Cancellation = lazyWithReload(() => import('../pages/legal/Cancellation.jsx'));
const Refund = lazyWithReload(() => import('../pages/legal/Refund.jsx'));

/* Auth */
const Login = lazyWithReload(() => import('../pages/auth/Login.jsx'));
const Register = lazyWithReload(() => import('../pages/auth/Register.jsx'));
const ForgotPassword = lazyWithReload(() => import('../pages/auth/ForgotPassword.jsx'));

/* Dashboard (candidate + employer) */
const Dashboard = lazyWithReload(() => import('../pages/dashboard/Dashboard.jsx'));
const Assistant = lazyWithReload(() => import('../pages/dashboard/Assistant.jsx'));
const Profile = lazyWithReload(() => import('../pages/dashboard/Profile.jsx'));
const Applications = lazyWithReload(() => import('../pages/dashboard/Applications.jsx'));
const SavedJobs = lazyWithReload(() => import('../pages/dashboard/SavedJobs.jsx'));
const EmployerJobs = lazyWithReload(() => import('../pages/dashboard/EmployerJobs.jsx'));
const EmployerJobForm = lazyWithReload(() => import('../pages/dashboard/EmployerJobForm.jsx'));
const EmployerApplications = lazyWithReload(() => import('../pages/dashboard/EmployerApplications.jsx'));

/* Admin */
const AdminDashboard = lazyWithReload(() => import('../pages/admin/AdminDashboard.jsx'));
const AdminUsers = lazyWithReload(() => import('../pages/admin/AdminUsers.jsx'));
const AdminJobs = lazyWithReload(() => import('../pages/admin/AdminJobs.jsx'));
const AdminApplications = lazyWithReload(() => import('../pages/admin/AdminApplications.jsx'));
const AdminCourses = lazyWithReload(() => import('../pages/admin/AdminCourses.jsx'));
const AdminBlogs = lazyWithReload(() => import('../pages/admin/AdminBlogs.jsx'));
const AdminFaqs = lazyWithReload(() => import('../pages/admin/AdminFaqs.jsx'));
const AdminConsultations = lazyWithReload(() => import('../pages/admin/AdminConsultations.jsx'));
const AdminMessages = lazyWithReload(() => import('../pages/admin/AdminMessages.jsx'));
const AdminTestimonials = lazyWithReload(() => import('../pages/admin/AdminTestimonials.jsx'));

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
            <Route path="cv-builder" element={<CvBuilder />} />
            <Route path="cv-templates" element={<CvTemplates />} />
            <Route path="upskills" element={<Upskills />} />
            <Route path="higher-education" element={<HigherEducation />} />
            <Route path="higher-education/:slug" element={<ProgrammeDetail track="education" />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:slug" element={<CourseDetail />} />
            <Route path="professional-courses" element={<ProfessionalCourses />} />
            <Route path="professional-courses/:slug" element={<ProgrammeDetail track="courses" />} />
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

            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>
          </Route>

          {/* Signed-in app shell: candidates, employers and partner institutes
              share it (each sees its own sidebar); admins have their own shell
              below. */}
          <Route element={<ProtectedRoute roles={['user', 'employer', 'institute']} />}>
            <Route element={<DashboardLayout />}>
              <Route element={<ProtectedRoute roles={['user', 'employer']} />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route element={<ProtectedRoute roles={['institute']} />}>
                <Route path="partner" element={<PartnerProfile />} />
              </Route>
              <Route element={<ProtectedRoute roles={['user']} />}>
                <Route path="applications" element={<Applications />} />
                <Route path="saved-jobs" element={<SavedJobs />} />
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
              <Route path="admin/partners" element={<AdminPartners />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}