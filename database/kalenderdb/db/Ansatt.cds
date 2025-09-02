namespace kalendersporer;

entity Ansatt 
{
  key id : Integer;
  navn : String;
  avdeling : String;
  role: String;
  leader: Association to Ansatt;
  fødselsdato : Date;
}