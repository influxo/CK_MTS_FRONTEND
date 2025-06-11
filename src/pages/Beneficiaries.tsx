import { BeneficiariesList } from "../components/beneficiaries/BeneficiariesList";
import { BeneficiaryDetails } from "../components/beneficiaries/BeneficiaryDetails";

interface BeneficiariesProps {
  selectedBeneficiaryId: string | null;
  onBeneficiarySelect: (beneficiaryId: string) => void;
  onBackToBeneficiaries: () => void;
}

export function Beneficiaries({
  selectedBeneficiaryId,
  onBeneficiarySelect,
  onBackToBeneficiaries,
}: BeneficiariesProps) {
  if (!selectedBeneficiaryId) {
    return <BeneficiariesList onBeneficiarySelect={onBeneficiarySelect} />;
  }

  return (
    <BeneficiaryDetails
      beneficiaryId={selectedBeneficiaryId}
      onBack={onBackToBeneficiaries}
    />
  );
}
