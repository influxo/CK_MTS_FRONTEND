import { useOutletContext } from "react-router-dom";
import { BeneficiariesList } from "../components/beneficiaries/BeneficiariesList";
import { BeneficiaryDetails } from "../components/beneficiaries/BeneficiaryDetails";

type AppLayoutContext = {
  selectedBeneficiaryId: string | null;
  setSelectedBeneficiaryId: (id: string | null) => void;
};

export function Beneficiaries() {
  const {
    selectedBeneficiaryId,
    setSelectedBeneficiaryId
  } = useOutletContext<AppLayoutContext>();

  const handleBeneficiarySelect = (beneficiaryId: string) => {
    setSelectedBeneficiaryId(beneficiaryId);
  };

  const handleBackToBeneficiaries = () => {
    setSelectedBeneficiaryId(null);
  };

  if (!selectedBeneficiaryId) {
    return <BeneficiariesList onBeneficiarySelect={handleBeneficiarySelect} />;
  }

  return (
    <BeneficiaryDetails
      beneficiaryId={selectedBeneficiaryId}
      onBack={handleBackToBeneficiaries}
    />
  );
}
