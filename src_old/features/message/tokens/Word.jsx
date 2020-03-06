import React from "react";

const Word = ({ value }) => <span dangerouslySetInnerHTML={{ __html: value }} />;

export default Word;
