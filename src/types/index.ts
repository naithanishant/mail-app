export type THeaderData = {
  text: string;
  logo: {
    url: string;
  };
  navigation_links: {
    link: {
      href: string;
      title: string;
    }[];
  };
};

export type TUsersData = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subscribed: boolean;
  created_at: string;
};

export type TEmailTemplateData = {
  uid: string;
  template_name: string;
  template_subject: string;
  template_body: string;
  active: boolean;
}

export type TLink = {
  href: string;
  title: string;
};

// New types for SendEmail component
export type TEmailTag = {
  id: string;
  label: string;
  value: string;
};

export type TSelectedUser = {
  id: string;
  name: string;
  email: string;
  subscribed: boolean;
};

export type TEmailForm = {
  subject: string;
  body: string;
  recipients: TSelectedUser[];
  tags: TEmailTag[];
};

export type TEmailFormErrors = {
  subject?: string;
  body?: string;
  recipients?: string;
  tags?: string;
};