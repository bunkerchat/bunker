export const newIsVersionV2Deployed = ({ version }) =>
	version.clientVersionV2New && version.clientVersionV2 !== version.clientVersionV2New;
