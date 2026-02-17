import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./routes/AppRouter";
import { AdMonetizationProvider } from "./state/AdMonetizationContext";
import { CommerceProvider } from "./state/CommerceContext";
import { OrderOperationsProvider } from "./state/OrderOperationsContext";
import { ProductModerationProvider } from "./state/ProductModerationContext";
import { VendorLifecycleProvider } from "./state/VendorLifecycleContext";
import "./styles/global.css";
import "./styles/glonni-theme.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <CommerceProvider>
        <VendorLifecycleProvider>
          <AdMonetizationProvider>
            <ProductModerationProvider>
              <OrderOperationsProvider>
                <AppRouter />
              </OrderOperationsProvider>
            </ProductModerationProvider>
          </AdMonetizationProvider>
        </VendorLifecycleProvider>
      </CommerceProvider>
    </BrowserRouter>
  </StrictMode>,
);
