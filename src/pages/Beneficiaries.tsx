import { useNavigate } from "react-router-dom";
import { BeneficiariesList } from "../components/beneficiaries/BeneficiariesList";

export function Beneficiaries() {
  const navigate = useNavigate();

  const handleBeneficiarySelect = (beneficiaryId: string) => {
    navigate(`/beneficiaries/${beneficiaryId}`);
  };

  return (
    <BeneficiariesList onBeneficiarySelect={handleBeneficiarySelect} />
  );
}
