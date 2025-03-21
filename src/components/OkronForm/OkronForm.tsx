import { useForm } from "react-hook-form";

interface OkronFormProps {
  id: string;
  loading: boolean;
  data: any;
  onSubmit: (data: any) => Promise<void>;
}

const OkronForm: React.FC<OkronFormProps> = ({
  id,
  loading,
  data,
  onSubmit,
}) => {
  const { register, handleSubmit, setValue } = useForm();

  return <></>;
};

export default OkronForm;
