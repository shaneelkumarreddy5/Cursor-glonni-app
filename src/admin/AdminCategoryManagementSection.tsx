import { useEffect, useMemo, useState } from "react";
import { formatInr } from "../utils/currency";
import { useAdmin } from "./AdminContext";
import {
  useVendorCategoryManagementSnapshot,
  updateVendorCategoryEnabled,
  updateVendorCategoryRuleConfig,
  type CategoryManagementMainCategoryNode,
  type CategoryManagementSubCategoryNode,
  type CategoryManagementSubSubCategoryNode,
  type CategoryTreeLevel,
  type VendorCategoryRuleConfig,
} from "../vendor/vendorCategorySystem";

type SelectedCategoryTarget = {
  mainCategoryCode: string;
  subCategoryCode?: string;
  subSubCategoryCode?: string;
};

type RuleDraftState = {
  cashbackPercentageInput: string;
  codInput: "inherit" | "yes" | "no";
  returnsInput: "inherit" | "yes" | "no";
  categoryTypeInput: "inherit" | "physical" | "digital";
};

type CategoryNodeView =
  | CategoryManagementMainCategoryNode
  | CategoryManagementSubCategoryNode
  | CategoryManagementSubSubCategoryNode;

function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function getLevelFromTarget(target: SelectedCategoryTarget): CategoryTreeLevel {
  if (target.subSubCategoryCode) {
    return "subSub";
  }
  if (target.subCategoryCode) {
    return "sub";
  }
  return "main";
}

function getEmptyRuleDraft(): RuleDraftState {
  return {
    cashbackPercentageInput: "",
    codInput: "inherit",
    returnsInput: "inherit",
    categoryTypeInput: "inherit",
  };
}

function mapNullableBooleanToDraftValue(value: boolean | null) {
  if (value === null) {
    return "inherit";
  }
  return value ? "yes" : "no";
}

function mapNullableCategoryTypeToDraftValue(value: VendorCategoryRuleConfig["categoryType"]) {
  if (value === null) {
    return "inherit";
  }
  return value === "Digital" ? "digital" : "physical";
}

function mapDraftValueToNullableBoolean(value: RuleDraftState["codInput"]) {
  if (value === "inherit") {
    return null;
  }
  return value === "yes";
}

function mapDraftValueToNullableCategoryType(value: RuleDraftState["categoryTypeInput"]) {
  if (value === "inherit") {
    return null;
  }
  return value === "digital" ? "Digital" : "Physical";
}

function getDraftFromRuleConfig(ruleConfig: VendorCategoryRuleConfig): RuleDraftState {
  return {
    cashbackPercentageInput:
      ruleConfig.cashbackPercentage === null ? "" : String(ruleConfig.cashbackPercentage),
    codInput: mapNullableBooleanToDraftValue(ruleConfig.codEligible),
    returnsInput: mapNullableBooleanToDraftValue(ruleConfig.returnEligible),
    categoryTypeInput: mapNullableCategoryTypeToDraftValue(ruleConfig.categoryType),
  };
}

function getSelectionFromSnapshot(categories: CategoryManagementMainCategoryNode[]) {
  const firstMainCategory = categories[0];
  if (!firstMainCategory) {
    return null;
  }
  return { mainCategoryCode: firstMainCategory.code } satisfies SelectedCategoryTarget;
}

function getSelectedNode(
  categories: CategoryManagementMainCategoryNode[],
  selectedTarget: SelectedCategoryTarget | null,
): CategoryNodeView | null {
  if (!selectedTarget) {
    return null;
  }
  const mainCategory = categories.find(
    (category) => category.code === selectedTarget.mainCategoryCode,
  );
  if (!mainCategory) {
    return null;
  }
  if (!selectedTarget.subCategoryCode) {
    return mainCategory;
  }

  const subCategory = mainCategory.children.find(
    (category) => category.code === selectedTarget.subCategoryCode,
  );
  if (!subCategory) {
    return null;
  }
  if (!selectedTarget.subSubCategoryCode) {
    return subCategory;
  }

  return (
    subCategory.children.find(
      (category) => category.code === selectedTarget.subSubCategoryCode,
    ) ?? null
  );
}

function getNodeStatusClass(isEnabled: boolean) {
  return isEnabled
    ? "admin-status-badge admin-status-approved"
    : "admin-status-badge admin-status-rejected";
}

export function AdminCategoryManagementSection() {
  const { adminName } = useAdmin();
  const { categories, auditLog } = useVendorCategoryManagementSnapshot();
  const [selectedTarget, setSelectedTarget] = useState<SelectedCategoryTarget | null>(
    () => getSelectionFromSnapshot(categories),
  );
  const [ruleDraft, setRuleDraft] = useState<RuleDraftState>(getEmptyRuleDraft);
  const [changeReason, setChangeReason] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTarget) {
      const initialSelection = getSelectionFromSnapshot(categories);
      if (initialSelection) {
        setSelectedTarget(initialSelection);
      }
      return;
    }

    const selectedNode = getSelectedNode(categories, selectedTarget);
    if (!selectedNode) {
      const initialSelection = getSelectionFromSnapshot(categories);
      setSelectedTarget(initialSelection);
      return;
    }

    setRuleDraft(getDraftFromRuleConfig(selectedNode.ruleConfig));
  }, [categories, selectedTarget]);

  const selectedNode = useMemo(
    () => getSelectedNode(categories, selectedTarget),
    [categories, selectedTarget],
  );
  const selectedLevel = selectedTarget ? getLevelFromTarget(selectedTarget) : "main";

  function handleToggleCategory(
    target: SelectedCategoryTarget,
    nextEnabledState: boolean,
    nodeLabel: string,
  ) {
    const result = updateVendorCategoryEnabled({
      ...target,
      isEnabled: nextEnabledState,
      reason: changeReason,
      adminName,
    });
    setFeedbackMessage(result.message);
    if (result.ok) {
      setSelectedTarget(target);
    } else if (!changeReason.trim()) {
      setFeedbackMessage(`${result.message} Category: ${nodeLabel}`);
    }
  }

  function handleSaveRuleConfig() {
    if (!selectedTarget) {
      setFeedbackMessage("Select a category node to update rules.");
      return;
    }

    const cashbackTrimmed = ruleDraft.cashbackPercentageInput.trim();
    const cashbackValue =
      cashbackTrimmed === "" ? null : Number.parseFloat(ruleDraft.cashbackPercentageInput);
    if (cashbackValue !== null && Number.isNaN(cashbackValue)) {
      setFeedbackMessage("Enter a valid cashback percentage or keep it blank for inherit.");
      return;
    }

    const result = updateVendorCategoryRuleConfig({
      ...selectedTarget,
      ruleConfig: {
        cashbackPercentage: cashbackValue,
        codEligible: mapDraftValueToNullableBoolean(ruleDraft.codInput),
        returnEligible: mapDraftValueToNullableBoolean(ruleDraft.returnsInput),
        categoryType: mapDraftValueToNullableCategoryType(ruleDraft.categoryTypeInput),
      },
      reason: changeReason,
      adminName,
    });
    setFeedbackMessage(result.message);
  }

  return (
    <section className="admin-placeholder-card">
      <header className="section-header">
        <h2>Category Management</h2>
      </header>
      <p>
        Manage category tree, rule inheritance (Sub-Sub &gt; Sub &gt; Main), and policy controls.
        Changes here automatically govern vendor category visibility and submission eligibility.
      </p>

      {feedbackMessage ? <p className="admin-action-feedback">{feedbackMessage}</p> : null}

      <label className="field">
        Admin change reason (mandatory)
        <textarea
          className="order-textarea"
          rows={3}
          value={changeReason}
          onChange={(event) => setChangeReason(event.target.value)}
          placeholder="Explain why this category or rule change is being applied"
        />
      </label>

      <div className="admin-category-management-grid">
        <article className="admin-category-panel">
          <h3>Category Tree (with codes)</h3>
          <div className="stack-sm">
            {categories.map((mainCategory) => (
              <div key={mainCategory.code} className="admin-category-tree-group">
                <div className="admin-category-tree-row">
                  <button
                    type="button"
                    className={
                      selectedTarget?.mainCategoryCode === mainCategory.code &&
                      !selectedTarget?.subCategoryCode
                        ? "btn btn-primary"
                        : "btn btn-secondary"
                    }
                    onClick={() =>
                      setSelectedTarget({ mainCategoryCode: mainCategory.code })
                    }
                  >
                    Main: {mainCategory.name}
                  </button>
                  <span className="admin-category-code">{mainCategory.code}</span>
                  <span className={getNodeStatusClass(mainCategory.isEnabled)}>
                    {mainCategory.isEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      handleToggleCategory(
                        { mainCategoryCode: mainCategory.code },
                        !mainCategory.isEnabled,
                        mainCategory.name,
                      )
                    }
                  >
                    {mainCategory.isEnabled ? "Disable" : "Enable"}
                  </button>
                </div>

                {mainCategory.children.map((subCategory) => (
                  <div key={`${mainCategory.code}-${subCategory.code}`}>
                    <div className="admin-category-tree-row is-sub">
                      <button
                        type="button"
                        className={
                          selectedTarget?.mainCategoryCode === mainCategory.code &&
                          selectedTarget?.subCategoryCode === subCategory.code &&
                          !selectedTarget?.subSubCategoryCode
                            ? "btn btn-primary"
                            : "btn btn-secondary"
                        }
                        onClick={() =>
                          setSelectedTarget({
                            mainCategoryCode: mainCategory.code,
                            subCategoryCode: subCategory.code,
                          })
                        }
                      >
                        Sub: {subCategory.name}
                      </button>
                      <span className="admin-category-code">
                        {mainCategory.code}-{subCategory.code}
                      </span>
                      <span className={getNodeStatusClass(subCategory.isEnabled)}>
                        {subCategory.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() =>
                          handleToggleCategory(
                            {
                              mainCategoryCode: mainCategory.code,
                              subCategoryCode: subCategory.code,
                            },
                            !subCategory.isEnabled,
                            `${mainCategory.name} > ${subCategory.name}`,
                          )
                        }
                      >
                        {subCategory.isEnabled ? "Disable" : "Enable"}
                      </button>
                    </div>

                    {subCategory.children.map((subSubCategory) => (
                      <div
                        key={`${mainCategory.code}-${subCategory.code}-${subSubCategory.code}`}
                        className="admin-category-tree-row is-sub-sub"
                      >
                        <button
                          type="button"
                          className={
                            selectedTarget?.mainCategoryCode === mainCategory.code &&
                            selectedTarget?.subCategoryCode === subCategory.code &&
                            selectedTarget?.subSubCategoryCode === subSubCategory.code
                              ? "btn btn-primary"
                              : "btn btn-secondary"
                          }
                          onClick={() =>
                            setSelectedTarget({
                              mainCategoryCode: mainCategory.code,
                              subCategoryCode: subCategory.code,
                              subSubCategoryCode: subSubCategory.code,
                            })
                          }
                        >
                          Sub-Sub: {subSubCategory.name}
                        </button>
                        <span className="admin-category-code">
                          {mainCategory.code}-{subCategory.code}-{subSubCategory.code}
                        </span>
                        <span className={getNodeStatusClass(subSubCategory.isEnabled)}>
                          {subSubCategory.isEnabled ? "Enabled" : "Disabled"}
                        </span>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() =>
                            handleToggleCategory(
                              {
                                mainCategoryCode: mainCategory.code,
                                subCategoryCode: subCategory.code,
                                subSubCategoryCode: subSubCategory.code,
                              },
                              !subSubCategory.isEnabled,
                              `${mainCategory.name} > ${subCategory.name} > ${subSubCategory.name}`,
                            )
                          }
                        >
                          {subSubCategory.isEnabled ? "Disable" : "Enable"}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </article>

        <article className="admin-category-panel">
          <h3>Rule Control</h3>
          {selectedNode ? (
            <div className="stack-sm">
              <p>
                Selected node: <strong>{selectedNode.categoryPath}</strong>
              </p>
              <p>
                Node code: <strong>{selectedNode.fullCode}</strong> • Level:{" "}
                <strong>{selectedLevel}</strong>
              </p>

              <label className="field">
                Cashback percentage (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={ruleDraft.cashbackPercentageInput}
                  onChange={(event) =>
                    setRuleDraft((currentState) => ({
                      ...currentState,
                      cashbackPercentageInput: event.target.value,
                    }))
                  }
                  placeholder="Leave blank for inherit"
                />
              </label>

              <label className="field">
                COD allowed
                <select
                  className="order-select"
                  value={ruleDraft.codInput}
                  onChange={(event) =>
                    setRuleDraft((currentState) => ({
                      ...currentState,
                      codInput: event.target.value as RuleDraftState["codInput"],
                    }))
                  }
                >
                  <option value="inherit">Inherit</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label className="field">
                Returns allowed
                <select
                  className="order-select"
                  value={ruleDraft.returnsInput}
                  onChange={(event) =>
                    setRuleDraft((currentState) => ({
                      ...currentState,
                      returnsInput: event.target.value as RuleDraftState["returnsInput"],
                    }))
                  }
                >
                  <option value="inherit">Inherit</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>

              <label className="field">
                Category type
                <select
                  className="order-select"
                  value={ruleDraft.categoryTypeInput}
                  onChange={(event) =>
                    setRuleDraft((currentState) => ({
                      ...currentState,
                      categoryTypeInput:
                        event.target.value as RuleDraftState["categoryTypeInput"],
                    }))
                  }
                >
                  <option value="inherit">Inherit</option>
                  <option value="physical">Physical</option>
                  <option value="digital">Digital</option>
                </select>
              </label>

              <button type="button" className="btn btn-primary" onClick={handleSaveRuleConfig}>
                Save Rule Configuration
              </button>

              <div className="admin-rule-preview-box">
                <p>
                  Final Cashback:{" "}
                  <strong>{selectedNode.effectiveRules.cashbackPercentage}%</strong> (
                  {selectedNode.effectiveRuleSources.cashbackPercentage})
                </p>
                <p>
                  Final COD:{" "}
                  <strong>
                    {selectedNode.effectiveRules.codEligible ? "Allowed" : "Disabled"}
                  </strong>{" "}
                  ({selectedNode.effectiveRuleSources.codEligible})
                </p>
                <p>
                  Final Returns:{" "}
                  <strong>
                    {selectedNode.effectiveRules.returnEligible ? "Allowed" : "Disabled"}
                  </strong>{" "}
                  ({selectedNode.effectiveRuleSources.returnEligible})
                </p>
                <p>
                  Final Type: <strong>{selectedNode.effectiveRules.categoryType}</strong> (
                  {selectedNode.effectiveRuleSources.categoryType})
                </p>
                <p>
                  Final Shipping:{" "}
                  <strong>
                    {selectedNode.effectiveRules.shippingRequired ? "Required" : "Disabled"}
                  </strong>{" "}
                  ({selectedNode.effectiveRuleSources.shippingRequired})
                </p>
                <p>
                  Derived product mode:{" "}
                  <strong>
                    {selectedNode.effectiveRules.isPhysical ? "Physical" : "Non-Physical"}
                  </strong>
                </p>
                <p>
                  Cashback preview on ₹1,000 order:{" "}
                  <strong>
                    {formatInr((1000 * selectedNode.effectiveRules.cashbackPercentage) / 100)}
                  </strong>
                </p>
                {selectedNode.fullCode.startsWith("GL-DIG") ? (
                  <p className="admin-vendor-status-message">
                    Digital category enforcement active: COD, Returns, and Shipping are forced
                    Disabled.
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p>No category node selected.</p>
          )}
        </article>
      </div>

      <article className="admin-category-panel">
        <h3>Category Audit Log (Admin Only)</h3>
        {auditLog.length > 0 ? (
          <div className="stack-sm">
            {auditLog.map((entry) => (
              <article key={entry.id} className="admin-audit-row">
                <div className="admin-audit-row-top">
                  <span className="admin-status-badge">{entry.actionType}</span>
                  <strong>{formatDateTime(entry.createdAtIso)}</strong>
                </div>
                <p>
                  Admin: <strong>{entry.adminName}</strong>
                </p>
                <p>
                  Level: <strong>{entry.level}</strong> • Category:{" "}
                  <strong>{entry.categoryPath}</strong> ({entry.categoryCode})
                </p>
                <p>{entry.changeSummary}</p>
                <p>Reason: {entry.reason}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>No category changes logged yet.</p>
        )}
      </article>
    </section>
  );
}
