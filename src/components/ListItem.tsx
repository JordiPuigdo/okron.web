import React from "react";
import Link from "next/link";


type Props = {
  data: any;
};

const ListItem = ({ data }: Props) => (
  <Link href="/machines/[id]" as={`/machines/${data.id}`}>
    Edit
  </Link>
);

export default ListItem;
