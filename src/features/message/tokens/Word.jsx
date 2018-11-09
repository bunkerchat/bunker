import React from "react";

const Word = ({ token }) => <span dangerouslySetInnerHTML={{ __html: token.value }} />;

export default Word
