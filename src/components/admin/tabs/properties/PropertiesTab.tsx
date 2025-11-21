import Card from "../../../ui/Card";
import Tabs from "../../../ui/Tabs";

type TabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type Props = {
  title?: string;
  tabs: TabItem[];
};

const PropertiesTab = ({ title = "Properties", tabs }: Props) => {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <Tabs variant="underline" tabs={tabs} />
    </Card>
  );
};

export default PropertiesTab;
