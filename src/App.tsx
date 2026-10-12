import { Route, Routes, useLocation } from "react-router-dom";
import CheckerWorkspace from "./components/CheckerWorkspace";
import GuidePage from "./pages/GuidePage";
import GuidesIndexPage from "./pages/GuidesIndexPage";
import SampleReportPage from "./pages/SampleReportPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import MerchantCenterIssuesPage from "./pages/MerchantCenterIssuesPage";
import AffectedProductsCsvCheckerPage from "./pages/AffectedProductsCsvCheckerPage";
import GoogleMerchantCenterReviewChecklistPage from "./pages/GoogleMerchantCenterReviewChecklistPage";
import MerchantCenterDiagnosticReportPage from "./pages/MerchantCenterDiagnosticReportPage";
import SEOHead from "./components/SEOHead";
import NotFoundPage from "./pages/NotFoundPage";
import RouteScroll from "./components/RouteScroll";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

function App() {
  const { pathname } = useLocation();
  return (
    <div className="site-shell">
      <SEOHead />
      <a className="pw-skip" href="#content">
        Skip to content
      </a>
      <SiteHeader />
      {/* Keep inputs and results in memory while browsing reference pages.
          A full reload clears them; uploaded data is never written to storage. */}
      <div hidden={pathname !== "/"}>
        <CheckerWorkspace />
      </div>
      <RouteScroll />
      <Routes>
        <Route path="/" element={null} />
        <Route
          path="/merchant-center-issues"
          element={<MerchantCenterIssuesPage />}
        />
        <Route
          path="/affected-products-csv-checker"
          element={<AffectedProductsCsvCheckerPage />}
        />
        <Route
          path="/google-merchant-center-review-checklist"
          element={<GoogleMerchantCenterReviewChecklistPage />}
        />
        <Route
          path="/merchant-center-diagnostic-report"
          element={<MerchantCenterDiagnosticReportPage />}
        />
        <Route path="/guides" element={<GuidesIndexPage />} />
        <Route path="/guides/:slug" element={<GuidePage />} />
        <Route path="/sample-report" element={<SampleReportPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <SiteFooter />
    </div>
  );
}

export default App;
