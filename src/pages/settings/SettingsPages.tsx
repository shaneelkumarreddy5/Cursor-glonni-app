import { SettingsPageTemplate } from "../../components/settings/SettingsPageTemplate";

export function SettingsOverviewPage() {
  return (
    <SettingsPageTemplate
      title="Settings Overview"
      description="Central hub for account tools, preferences, and support modules."
      bullets={[
        "Use the sidebar to navigate each settings area",
        "Each module is UI-only placeholder content",
        "No backend, auth, or business logic is connected yet",
      ]}
    />
  );
}

export function OrdersSettingsPage() {
  return (
    <SettingsPageTemplate
      title="Orders"
      description="Track, manage, and review customer orders in this settings module."
      bullets={[
        "Order history table and filters placeholder",
        "Order status timeline placeholder",
        "Reorder and return actions placeholder",
      ]}
    />
  );
}

export function WalletSettingsPage() {
  return (
    <SettingsPageTemplate
      title="Wallet"
      description="Wallet balance, credits, and transaction history placeholders."
      bullets={[
        "Credit and cashback summary placeholder",
        "Transaction list placeholder",
        "Add funds CTA placeholder",
      ]}
    />
  );
}

export function SupportSettingsPage() {
  return (
    <SettingsPageTemplate
      title="Support"
      description="Support preferences and ticketing dashboard UI scaffold."
      bullets={[
        "FAQ and knowledge base links placeholder",
        "Open support requests placeholder",
        "Chat/contact form module placeholder",
      ]}
    />
  );
}

export function ProfileSettingsPage() {
  return (
    <SettingsPageTemplate
      title="Profile"
      description="Manage account profile details and personal preferences."
      bullets={[
        "Name, photo, and account details placeholder",
        "Preferences and language settings placeholder",
        "Privacy controls placeholder",
      ]}
    />
  );
}

export function AddressesSettingsPage() {
  return (
    <SettingsPageTemplate
      title="Addresses"
      description="Address book management placeholders for delivery and billing."
      bullets={[
        "Saved address list placeholder",
        "Add/edit/delete address controls placeholder",
        "Default address selector placeholder",
      ]}
    />
  );
}

export function NotificationsSettingsPage() {
  return (
    <SettingsPageTemplate
      title="Notifications"
      description="Manage alerts, subscriptions, and communication channels."
      bullets={[
        "Email, SMS, and push toggle groups placeholder",
        "Order and promotion alert settings placeholder",
        "Quiet hours and frequency controls placeholder",
      ]}
    />
  );
}
