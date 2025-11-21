import Field from "./Field";

type Props = {
  details: Record<string, unknown>;
};

const PropertyOthers = ({ details }: Props) => {
  const type = details.type;
  const mahaReraNumber = details.mahaReraNumber as string | undefined;
  const mahaReraLink = details.mahaReraLink as string | undefined;
  const possessionMonth = details.possessionMonth as string | undefined;
  const possessionYear = details.possessionYear as string | number | undefined;
  const isCosmo = details.isCosmo as boolean | undefined;
  const availibility = details.availibility as string | undefined;
  const imageUrl = details.imageUrl as string | undefined;
  const videoUrl = details.videoUrl as string | undefined;
  const siteHeadname = details.siteHeadname as string | undefined;
  const siteHeadNumber = details.siteHeadNumber as string | undefined;

  return (
    <div>
      <h4 className="text-md font-semibold text-neutral-700 mb-2">Others</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-neutral-200 p-4 rounded-md bg-neutral-50">
        <Field label="Project Type" value={type} />

        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Maha RERA Number</div>
          <div className="text-neutral-800">
            {mahaReraNumber ? (
              mahaReraLink ? (
                <a
                  href={mahaReraLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {mahaReraNumber}
                </a>
              ) : (
                mahaReraNumber
              )
            ) : (
              "-"
            )}
          </div>
        </div>

        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Possession</div>
          <div className="text-neutral-800">{`${possessionMonth || "-"} ${
            possessionYear || ""
          }`}</div>
        </div>

        <Field label="Is Cosmo?" value={isCosmo} />
        <Field label="Availability" value={availibility} />

        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Image URL</div>
          <div className="text-neutral-800">
            {imageUrl ? (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Images
              </a>
            ) : (
              "-"
            )}
          </div>
        </div>

        <div className="text-sm">
          <div className="text-neutral-500 font-medium">Video URL</div>
          <div className="text-neutral-800">
            {videoUrl ? (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Video
              </a>
            ) : (
              "-"
            )}
          </div>
        </div>

        <Field label="Site Head Name" value={siteHeadname} />
        <Field label="Site Head Number" value={siteHeadNumber} />
      </div>
    </div>
  );
};

export default PropertyOthers;
